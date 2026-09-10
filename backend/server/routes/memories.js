const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { mockStore } = require("../utils/seedData");
const Memory = require("../models/Memory");
const { getIsConnected } = require("../config/db");

// @route   GET /api/v1/memories
router.get("/", protect, async (req, res) => {
  const { category } = req.query;

  if (getIsConnected()) {
    try {
      const query = { user: req.user.id, isConfirmed: true };
      if (category && category !== "ALL") query.category = category;
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
  res.json(list);
});

// @route   POST /api/v1/memories
router.post("/", protect, async (req, res) => {
  const { category, title, value, isSensitive, sourceContext } = req.body;

  if (getIsConnected()) {
    try {
      const memory = await Memory.create({
        user: req.user.id,
        category,
        title,
        value,
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
    category,
    title,
    value,
    confidenceScore: 1.0,
    isConfirmed: true,
    isSensitive: isSensitive || false,
    sourceContext: sourceContext || "Confirmed by Student",
    createdAt: new Date().toISOString(),
  };

  mockStore.memories.unshift(newMem);
  res.status(201).json(newMem);
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
