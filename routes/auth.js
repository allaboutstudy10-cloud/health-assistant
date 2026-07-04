// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config");

const router = express.Router();

// ---------- REGISTER ----------
// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, age, gender, height, weight } = req.body;

    // Basic validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Parse numeric fields so they're stored as numbers, not raw strings
    const parsedAge = age ? parseInt(age) : null;
    const parsedHeight = height ? parseFloat(height) : null;
    const parsedWeight = weight ? parseFloat(weight) : null;

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      age: parsedAge,
      gender: gender || null,
      height: parsedHeight,
      weight: parsedWeight,
    });

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong while creating your account." });
  }
});

// ---------- LOGIN ----------
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong while logging in." });
  }
});

module.exports = router;
