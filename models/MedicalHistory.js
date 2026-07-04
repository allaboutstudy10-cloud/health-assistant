// models/MedicalHistory.js
const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  diseaseName: { type: String, default: null },
  problems: { type: String, default: null },
  medicines: { type: String, default: null },
  allergies: { type: String, default: null },
  notes: { type: String, default: null },
  recordDate: { type: String, required: true },
  recordTime: { type: String, required: true },
});

module.exports = mongoose.model("MedicalHistory", medicalHistorySchema);
