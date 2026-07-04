// routes/history.js
const express = require("express");
const requireAuth = require("../middleware/auth");
const MedicalHistory = require("../models/MedicalHistory");

const router = express.Router();
router.use(requireAuth);

function nowParts() {
  const now = new Date();
  return {
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0],
  };
}

function toJSON(doc) {
  return {
    id: doc._id,
    diseaseName: doc.diseaseName,
    problems: doc.problems,
    medicines: doc.medicines,
    allergies: doc.allergies,
    notes: doc.notes,
    date: doc.recordDate,
    time: doc.recordTime,
  };
}

// POST /api/history  -> add a medical history entry
router.post("/", async (req, res) => {
  const { diseaseName, problems, medicines, allergies, notes } = req.body;
  const { date, time } = nowParts();

  const doc = await MedicalHistory.create({
    userId: req.userId,
    diseaseName: diseaseName || null,
    problems: problems || null,
    medicines: medicines || null,
    allergies: allergies || null,
    notes: notes || null,
    recordDate: date,
    recordTime: time,
  });

  res.status(201).json(toJSON(doc));
});

// GET /api/history -> list all entries, newest first (for the timeline)
router.get("/", async (req, res) => {
  const rows = await MedicalHistory.find({ userId: req.userId }).sort({ _id: -1 });
  res.json(rows.map(toJSON));
});

// PUT /api/history/:id -> edit an entry
router.put("/:id", async (req, res) => {
  const { diseaseName, problems, medicines, allergies, notes } = req.body;

  await MedicalHistory.updateOne(
    { _id: req.params.id, userId: req.userId },
    {
      diseaseName: diseaseName || null,
      problems: problems || null,
      medicines: medicines || null,
      allergies: allergies || null,
      notes: notes || null,
    }
  );

  res.json({ message: "Medical history entry updated." });
});

// DELETE /api/history/:id
router.delete("/:id", async (req, res) => {
  await MedicalHistory.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Medical history entry deleted." });
});

module.exports = router;
