const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { protect, JWT_SECRET } = require("../middleware/auth");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { getIsConnected } = require("../config/db");

// @route   POST /api/v1/auth/register
router.post("/register", async (req, res) => {
  const { email, password, major, academicYear } = req.body;
  const fullName = req.body.fullName || req.body.name;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please provide fullName (or name), email, and password" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const profile = await StudentProfile.create({
      user: user._id,
      major: major || "General Studies",
      academicYear: academicYear || "Year 1",
    });

    user.profile = profile._id;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      token,
      tokenType: "Bearer",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        major: profile.major,
        academicYear: profile.academicYear,
        gpa: profile.gpa,
        masteryScore: profile.masteryScore,
        studyStreakDays: profile.studyStreakDays,
      },
    });
  } catch (err) {
    console.error("[Auth Register Error]", err.message);
    return res.status(500).json({ message: err.message || "Failed to register user" });
  }
});

// @route   POST /api/v1/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("profile");
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, fullName: user.fullName },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.json({
        token,
        tokenType: "Bearer",
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          major: user.profile?.major || "General Studies",
          academicYear: user.profile?.academicYear || "Year 1",
          gpa: user.profile?.gpa ?? 0.0,
          masteryScore: user.profile?.masteryScore ?? 0.0,
          studyStreakDays: user.profile?.studyStreakDays ?? 0,
        },
      });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    console.error("[Auth Login Error]", err.message);
    return res.status(500).json({ message: err.message || "Authentication failed" });
  }
});

// @route   GET /api/v1/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("profile");
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    return res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      major: user.profile?.major || "General Studies",
      academicYear: user.profile?.academicYear || "Year 1",
      gpa: user.profile?.gpa ?? 0.0,
      masteryScore: user.profile?.masteryScore ?? 0.0,
      studyStreakDays: user.profile?.studyStreakDays ?? 0,
    });
  } catch (err) {
    console.error("[Auth Me Error]", err.message);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

module.exports = router;
