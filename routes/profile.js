// routes/profile.js
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// All routes here require a logged-in user
router.use(requireAuth);

// ---------- GET PROFILE ----------
// GET /api/profile
router.get("/", async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found." });

  res.json({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    age: user.age,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    createdAt: user.createdAt,
  });
});

// ---------- UPDATE PROFILE ----------
// PUT /api/profile
router.put("/", async (req, res) => {
  try {
    const { fullName, age, gender, height, weight, newPassword } = req.body;

    // Parse numeric fields so they're stored as numbers, not raw strings
    const parsedAge = age ? parseInt(age) : null;
    const parsedHeight = height ? parseFloat(height) : null;
    const parsedWeight = weight ? parseFloat(weight) : null;

    const update = {
      fullName,
      age: parsedAge,
      gender: gender || null,
      height: parsedHeight,
      weight: parsedWeight,
    };

    // Optional password change — awaited so the response only goes out
    // after the new password hash has actually been saved.
    if (newPassword && newPassword.trim().length > 0) {
      update.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await User.updateOne({ _id: req.userId }, update);

    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong while updating your profile." });
  }
});

module.exports = router;
