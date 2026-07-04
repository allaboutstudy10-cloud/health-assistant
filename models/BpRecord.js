// models/BpRecord.js
const mongoose = require("mongoose");

const bpRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  systolic: { type: Number, required: true },
  diastolic: { type: Number, required: true },
  status: { type: String, required: true },
  recordDate: { type: String, required: true },
  recordTime: { type: String, required: true },
});

module.exports = mongoose.model("BpRecord", bpRecordSchema);
