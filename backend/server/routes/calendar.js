const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const CalendarEvent = require("../models/CalendarEvent");

// @route   GET /api/v1/calendar/events
router.get("/events", protect, async (req, res) => {
  try {
    const events = await CalendarEvent.find({ user: req.user.id }).sort({ startTime: 1 });
    return res.json(events);
  } catch (err) {
    console.error("[Calendar GET Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch calendar events" });
  }
});

// @route   POST /api/v1/calendar/events
router.post("/events", protect, async (req, res) => {
  const { title, description, eventType, roomLocation, startTime, endTime } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Event title is required" });
  }

  try {
    const event = await CalendarEvent.create({
      user: req.user.id,
      title: title.trim(),
      description: description || "",
      eventType: eventType || "AI_STUDY_BLOCK",
      roomLocation: roomLocation || "Library",
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 3600000),
    });
    return res.status(201).json(event);
  } catch (err) {
    console.error("[Calendar POST Error]", err.message);
    return res.status(500).json({ message: "Failed to create calendar event" });
  }
});

// @route   DELETE /api/v1/calendar/events/:id
router.delete("/events/:id", protect, async (req, res) => {
  try {
    const result = await CalendarEvent.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("[Calendar DELETE Error]", err.message);
    return res.status(500).json({ message: "Failed to delete calendar event" });
  }
});

module.exports = router;
