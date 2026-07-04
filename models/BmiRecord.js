// models/BmiRecord.js
const mongoose = require("mongoose");

const bmiRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  bmi: { type: Number, required: true },
  category: { type: String, required: true },
  recordDate: { type: String, required: true }, // YYYY-MM-DD
  recordTime: { type: String, required: true }, // HH:MM:SS
});

module.exports = mongoose.model("BmiRecord", bmiRecordSchema);
