// routes/health.js
const express = require("express");
const requireAuth = require("../middleware/auth");
const BmiRecord = require("../models/BmiRecord");
const TemperatureRecord = require("../models/TemperatureRecord");
const BpRecord = require("../models/BpRecord");
const {
  calculateBMI,
  getBMICategory,
  getTemperatureStatus,
  getBPStatus,
} = require("../utils/healthLogic");

const router = express.Router();
router.use(requireAuth);

// Small helper to get today's date/time as separate strings
function nowParts() {
  const now = new Date();
  return {
    date: now.toISOString().split("T")[0], // YYYY-MM-DD
    time: now.toTimeString().split(" ")[0], // HH:MM:SS
  };
}

// Reshape a Mongo document into the same flat shape the frontend
// already expects from the old SQLite rows.
function toBmiJSON(doc) {
  return {
    id: doc._id,
    weight: doc.weight,
    height: doc.height,
    bmi: doc.bmi,
    category: doc.category,
    record_date: doc.recordDate,
    record_time: doc.recordTime,
  };
}
function toTempJSON(doc) {
  return {
    id: doc._id,
    temperature: doc.temperature,
    status: doc.status,
    record_date: doc.recordDate,
    record_time: doc.recordTime,
  };
}
function toBpJSON(doc) {
  return {
    id: doc._id,
    systolic: doc.systolic,
    diastolic: doc.diastolic,
    status: doc.status,
    record_date: doc.recordDate,
    record_time: doc.recordTime,
  };
}

/* ===================== BMI ===================== */

// POST /api/health/bmi
router.post("/bmi", async (req, res) => {
  const weight = parseFloat(req.body.weight);
  const height = parseFloat(req.body.height);

  if (!weight || !height || isNaN(weight) || isNaN(height)) {
    return res.status(400).json({ message: "Weight and height are required." });
  }

  const bmi = calculateBMI(weight, height);
  const category = getBMICategory(bmi);
  const { date, time } = nowParts();

  const doc = await BmiRecord.create({
    userId: req.userId,
    weight,
    height,
    bmi,
    category,
    recordDate: date,
    recordTime: time,
  });

  res.status(201).json(toBmiJSON(doc));
});

// GET /api/health/bmi
router.get("/bmi", async (req, res) => {
  const rows = await BmiRecord.find({ userId: req.userId }).sort({ _id: -1 });
  res.json(rows.map(toBmiJSON));
});

// DELETE /api/health/bmi/:id
router.delete("/bmi/:id", async (req, res) => {
  await BmiRecord.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: "BMI record deleted." });
});

/* ===================== TEMPERATURE ===================== */

// POST /api/health/temperature
router.post("/temperature", async (req, res) => {
  const temperature = parseFloat(req.body.temperature);
  if (!temperature || isNaN(temperature)) {
    return res.status(400).json({ message: "Temperature is required." });
  }

  const status = getTemperatureStatus(temperature);
  const { date, time } = nowParts();

  const doc = await TemperatureRecord.create({
    userId: req.userId,
    temperature,
    status,
    recordDate: date,
    recordTime: time,
  });

  res.status(201).json(toTempJSON(doc));
});

// GET /api/health/temperature
router.get("/temperature", async (req, res) => {
  const rows = await TemperatureRecord.find({ userId: req.userId }).sort({ _id: -1 });
  res.json(rows.map(toTempJSON));
});

// DELETE /api/health/temperature/:id
router.delete("/temperature/:id", async (req, res) => {
  await TemperatureRecord.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Temperature record deleted." });
});

/* ===================== BLOOD PRESSURE ===================== */

// POST /api/health/bp
router.post("/bp", async (req, res) => {
  const systolic = parseInt(req.body.systolic);
  const diastolic = parseInt(req.body.diastolic);

  if (!systolic || !diastolic || isNaN(systolic) || isNaN(diastolic)) {
    return res.status(400).json({ message: "Systolic and diastolic values are required." });
  }

  const status = getBPStatus(systolic, diastolic);
  const { date, time } = nowParts();

  const doc = await BpRecord.create({
    userId: req.userId,
    systolic,
    diastolic,
    status,
    recordDate: date,
    recordTime: time,
  });

  res.status(201).json(toBpJSON(doc));
});

// GET /api/health/bp
router.get("/bp", async (req, res) => {
  const rows = await BpRecord.find({ userId: req.userId }).sort({ _id: -1 });
  res.json(rows.map(toBpJSON));
});

// DELETE /api/health/bp/:id
router.delete("/bp/:id", async (req, res) => {
  await BpRecord.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Blood pressure record deleted." });
});

module.exports = router;
