const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { mockStore } = require("../utils/seedData");
const CalendarEvent = require("../models/CalendarEvent");
const { getIsConnected } = require("../config/db");

// @route   GET /api/v1/calendar/events
router.get("/events", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      const events = await CalendarEvent.find({ user: req.user.id }).sort({ startTime: 1 });
      return res.json(events);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  res.json(mockStore.calendarEvents);
});

// @route   POST /api/v1/calendar/events
router.post("/events", protect, async (req, res) => {
  const { title, description, eventType, roomLocation, startTime, endTime } = req.body;

  if (getIsConnected()) {
    try {
      const event = await CalendarEvent.create({
        user: req.user.id,
        title,
        description: description || "",
        eventType: eventType || "AI_STUDY_BLOCK",
        roomLocation: roomLocation || "Library",
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 3600000),
      });
      return res.status(201).json(event);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const newEvent = {
    id: `event-${Date.now()}`,
    title,
    description: description || "",
    eventType: eventType || "AI_STUDY_BLOCK",
    roomLocation: roomLocation || "Library",
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  mockStore.calendarEvents.push(newEvent);
  res.status(201).json(newEvent);
});

// @route   DELETE /api/v1/calendar/events/:id
router.delete("/events/:id", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      await CalendarEvent.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  mockStore.calendarEvents = mockStore.calendarEvents.filter((e) => e.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
