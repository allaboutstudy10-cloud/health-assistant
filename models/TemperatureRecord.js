// models/TemperatureRecord.js
const mongoose = require("mongoose");

const temperatureRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  temperature: { type: Number, required: true }, // Celsius
  status: { type: String, required: true },
  recordDate: { type: String, required: true },
  recordTime: { type: String, required: true },
});

module.exports = mongoose.model("TemperatureRecord", temperatureRecordSchema);
