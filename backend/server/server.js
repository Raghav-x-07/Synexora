require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth");
const memoryRoutes = require("./routes/memories");
const taskRoutes = require("./routes/tasks");
const noteRoutes = require("./routes/notes");
const calendarRoutes = require("./routes/calendar");
const goalRoutes = require("./routes/goals");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB (with automatic graceful fallback)
connectDB();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/memories", memoryRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/calendar", calendarRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Health & Info Endpoint
app.get(["/api/v1/health", "/health", "/"], (req, res) => {
  res.json({
    status: "UP",
    service: "Synexora MERN Core API",
    version: "1.0.0",
    stack: "MERN (MongoDB, Express, React, Node.js)",
    endpoints: [
      "/api/v1/auth/login",
      "/api/v1/auth/register",
      "/api/v1/auth/me",
      "/api/v1/dashboard/summary",
      "/api/v1/memories",
      "/api/v1/tasks",
      "/api/v1/notes",
      "/api/v1/calendar/events",
      "/api/v1/goals",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Fallback error handling
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`\x1b[32m%s\x1b[0m`, `✓ Synexora MERN API server listening on http://localhost:${PORT}`);
  console.log(`\x1b[36m%s\x1b[0m`, `  Health Check: http://localhost:${PORT}/api/v1/health`);
});

module.exports = app;
