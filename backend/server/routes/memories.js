const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { mockStore } = require("../utils/seedData");
const Memory = require("../models/Memory");
const { getIsConnected } = require("../config/db");

// @route   GET /api/v1/memories
router.get("/", protect, async (req, res) => {
  const { category, search } = req.query;

  if (getIsConnected()) {
    try {
      const query = { user: req.user.id, isConfirmed: true };
      if (category && category !== "ALL") query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { value: { $regex: search, $options: "i" } },
        ];
      }
      const memories = await Memory.find(query).sort({ createdAt: -1 });
      return res.json(memories);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  let list = mockStore.memories;
  if (category && category !== "ALL") {
    list = list.filter((m) => m.category === category);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((m) => m.title.toLowerCase().includes(s) || m.value.toLowerCase().includes(s));
  }
  res.json(list);
});

// @route   POST /api/v1/memories
router.post("/", protect, async (req, res) => {
  const { category, title, value, isSensitive, sourceContext, confidenceScore } = req.body;

  if (!title || !value) {
    return res.status(400).json({ message: "Title and Value are required for memory creation." });
  }

  if (getIsConnected()) {
    try {
      const memory = await Memory.create({
        user: req.user.id,
        category: category || "Academic Performance",
        title,
        value,
        confidenceScore: confidenceScore || 1.0,
        isConfirmed: true,
        isSensitive: isSensitive || false,
        sourceContext: sourceContext || "Confirmed by Student",
      });
      return res.status(201).json(memory);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const newMem = {
    id: `mem-${Date.now()}`,
    category: category || "Academic Performance",
    title,
    value,
    confidenceScore: confidenceScore || 1.0,
    isConfirmed: true,
    isSensitive: isSensitive || false,
    sourceContext: sourceContext || "Confirmed by Student",
    createdAt: new Date().toISOString(),
  };

  mockStore.memories.unshift(newMem);
  res.status(201).json(newMem);
});

// @route   PUT /api/v1/memories/:id
router.put("/:id", protect, async (req, res) => {
  const { title, value, category, isSensitive } = req.body;

  if (getIsConnected()) {
    try {
      const memory = await Memory.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { title, value, category, isSensitive },
        { new: true }
      );
      if (!memory) return res.status(404).json({ message: "Memory not found" });
      return res.json(memory);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const idx = mockStore.memories.findIndex((m) => m.id === req.params.id);
  if (idx !== -1) {
    mockStore.memories[idx] = {
      ...mockStore.memories[idx],
      title: title || mockStore.memories[idx].title,
      value: value || mockStore.memories[idx].value,
      category: category || mockStore.memories[idx].category,
      isSensitive: isSensitive !== undefined ? isSensitive : mockStore.memories[idx].isSensitive,
      updatedAt: new Date().toISOString(),
    };
    return res.json(mockStore.memories[idx]);
  }

  res.status(404).json({ message: "Memory not found in local store" });
});

// @route   DELETE /api/v1/memories/:id
router.delete("/:id", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      await Memory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  mockStore.memories = mockStore.memories.filter((m) => m.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
