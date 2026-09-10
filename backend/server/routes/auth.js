const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { protect, JWT_SECRET } = require("../middleware/auth");
const { mockStore } = require("../utils/seedData");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { getIsConnected } = require("../config/db");

// @route   POST /api/v1/auth/register
router.post("/register", async (req, res) => {
  const { fullName, email, password, major, academicYear } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please provide fullName, email, and password" });
  }

  if (getIsConnected()) {
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({ fullName, email, password });
      const profile = await StudentProfile.create({
        user: user._id,
        major: major || "Computer Science & Engineering",
        academicYear: academicYear || "Year 3",
      });

      user.profile = profile._id;
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: "30d",
      });

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
      return res.status(500).json({ message: err.message });
    }
  }

  // Fallback in-memory
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role: "ROLE_STUDENT",
    major: major || "Computer Science",
    academicYear: academicYear || "Year 1",
    gpa: 4.0,
    masteryScore: 75.0,
    studyStreakDays: 1,
  };

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
    expiresIn: "30d",
  });

  res.status(201).json({
    token,
    tokenType: "Bearer",
    user: newUser,
  });
});

// @route   POST /api/v1/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  if (getIsConnected()) {
    try {
      const user = await User.findOne({ email }).populate("profile");
      if (user && (await user.matchPassword(password))) {
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
          expiresIn: "30d",
        });

        return res.json({
          token,
          tokenType: "Bearer",
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            major: user.profile?.major || "Computer Science",
            academicYear: user.profile?.academicYear || "Year 3",
            gpa: user.profile?.gpa || 3.85,
            masteryScore: user.profile?.masteryScore || 84.0,
            studyStreakDays: user.profile?.studyStreakDays || 14,
          },
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  // In-memory fallback
  if (email === "alex.rivera@synexora.io" || email.includes("@")) {
    const token = jwt.sign({ id: mockStore.user.id, email, role: "ROLE_STUDENT" }, JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.json({
      token,
      tokenType: "Bearer",
      user: { ...mockStore.user, email },
    });
  }

  res.status(401).json({ message: "Invalid email or password" });
});

// @route   GET /api/v1/auth/me
router.get("/me", protect, async (req, res) => {
  if (getIsConnected()) {
    try {
      const user = await User.findById(req.user.id).populate("profile");
      if (user) {
        return res.json({
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          major: user.profile?.major,
          academicYear: user.profile?.academicYear,
          gpa: user.profile?.gpa,
          masteryScore: user.profile?.masteryScore,
          studyStreakDays: user.profile?.studyStreakDays,
        });
      }
    } catch (err) {}
  }

  res.json(mockStore.user);
});

module.exports = router;
