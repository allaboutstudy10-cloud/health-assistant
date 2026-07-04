// routes/dashboard.js
const express = require("express");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");
const BmiRecord = require("../models/BmiRecord");
const TemperatureRecord = require("../models/TemperatureRecord");
const BpRecord = require("../models/BpRecord");
const { getRecommendations, DISCLAIMER } = require("../utils/healthLogic");

const router = express.Router();
router.use(requireAuth);

// GET /api/dashboard
// Pulls together everything the dashboard page needs in one call.
router.get("/", async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found." });

  const [latestBmi, latestTemp, latestBp, allBmi, allTemp, allBp] = await Promise.all([
    BmiRecord.findOne({ userId: req.userId }).sort({ _id: -1 }),
    TemperatureRecord.findOne({ userId: req.userId }).sort({ _id: -1 }),
    BpRecord.findOne({ userId: req.userId }).sort({ _id: -1 }),
    BmiRecord.find({ userId: req.userId }),
    TemperatureRecord.find({ userId: req.userId }),
    BpRecord.find({ userId: req.userId }),
  ]);

  // Combine the 5 most recent records across all types for the
  // "Recent health records" list on the dashboard.
  const recentBmi = allBmi.map((r) => ({
    id: r._id,
    type: "BMI",
    value: r.bmi,
    status: r.category,
    record_date: r.recordDate,
    record_time: r.recordTime,
  }));
  const recentTemp = allTemp.map((r) => ({
    id: r._id,
    type: "Temperature",
    value: r.temperature,
    status: r.status,
    record_date: r.recordDate,
    record_time: r.recordTime,
  }));
  const recentBp = allBp.map((r) => ({
    id: r._id,
    type: "Blood Pressure",
    value: `${r.systolic}/${r.diastolic}`,
    status: r.status,
    record_date: r.recordDate,
    record_time: r.recordTime,
  }));

  const recentRecords = [...recentBmi, ...recentTemp, ...recentBp]
    .sort((a, b) => `${b.record_date} ${b.record_time}`.localeCompare(`${a.record_date} ${a.record_time}`))
    .slice(0, 5);

  const recommendations = getRecommendations({
    bmiCategory: latestBmi ? latestBmi.category : null,
    tempStatus: latestTemp ? latestTemp.status : null,
    bpStatus: latestBp ? latestBp.status : null,
  });

  res.json({
    user: {
      fullName: user.fullName,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
    },
    latestBmi: latestBmi
      ? {
          id: latestBmi._id,
          weight: latestBmi.weight,
          height: latestBmi.height,
          bmi: latestBmi.bmi,
          category: latestBmi.category,
          record_date: latestBmi.recordDate,
          record_time: latestBmi.recordTime,
        }
      : null,
    latestTemp: latestTemp
      ? {
          id: latestTemp._id,
          temperature: latestTemp.temperature,
          status: latestTemp.status,
          record_date: latestTemp.recordDate,
          record_time: latestTemp.recordTime,
        }
      : null,
    latestBp: latestBp
      ? {
          id: latestBp._id,
          systolic: latestBp.systolic,
          diastolic: latestBp.diastolic,
          status: latestBp.status,
          record_date: latestBp.recordDate,
          record_time: latestBp.recordTime,
        }
      : null,
    recentRecords,
    recommendations,
    disclaimer: DISCLAIMER,
  });
});

module.exports = router;
