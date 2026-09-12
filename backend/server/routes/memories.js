const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Memory = require("../models/Memory");

// @route   GET /api/v1/memories
router.get("/", protect, async (req, res) => {
  const { category, search } = req.query;

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
    console.error("[Memories GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch memories" });
  }
});

// @route   POST /api/v1/memories
router.post("/", protect, async (req, res) => {
  const { category, title, value, isSensitive, sourceContext, confidenceScore } = req.body;

  if (!title || !title.trim() || !value || !value.trim()) {
    return res.status(400).json({ message: "Title and Value are required for memory creation." });
  }

  try {
    const memory = await Memory.create({
      user: req.user.id,
      category: category || "Academic Performance",
      title: title.trim(),
      value: value.trim(),
      confidenceScore: confidenceScore !== undefined ? confidenceScore : 1.0,
      isConfirmed: true,
      isSensitive: isSensitive || false,
      sourceContext: sourceContext || "Confirmed by Student",
    });
    return res.status(201).json(memory);
  } catch (err) {
    console.error("[Memories POST Error]", err.message);
    return res.status(500).json({ message: "Failed to create memory" });
  }
});

// @route   PUT /api/v1/memories/:id
router.put("/:id", protect, async (req, res) => {
  const { title, value, category, isSensitive } = req.body;

  try {
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, value, category, isSensitive },
      { new: true }
    );
    if (!memory) return res.status(404).json({ message: "Memory not found" });
    return res.json(memory);
  } catch (err) {
    console.error("[Memories PUT Error]", err.message);
    return res.status(500).json({ message: "Failed to update memory" });
  }
});

// @route   DELETE /api/v1/memories/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await Memory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Memory not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("[Memories DELETE Error]", err.message);
    return res.status(500).json({ message: "Failed to delete memory" });
  }
});

module.exports = router;
