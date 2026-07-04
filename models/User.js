// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  age: { type: Number, default: null },
  gender: { type: String, default: null },
  height: { type: Number, default: null }, // centimeters
  weight: { type: Number, default: null }, // kilograms
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
