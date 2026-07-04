// routes/symptoms.js
// Two endpoints:
//   GET  /api/symptoms/list  → returns the full symptom catalogue
//                              (so the frontend can build the checklist
//                               dynamically without hard-coding anything)
//   POST /api/symptoms/check → receives an array of selected symptom IDs,
//                              returns matched conditions + advice

const express = require("express");
const requireAuth = require("../middleware/auth");
const MedicalHistory = require("../models/MedicalHistory");
const { SYMPTOMS, analyzeSymptoms, buildHistorySummary, DISCLAIMER } = require("../utils/symptomLogic");

const router = express.Router();
router.use(requireAuth);

// GET /api/symptoms/list
router.get("/list", (req, res) => {
  res.json({ symptoms: SYMPTOMS, disclaimer: DISCLAIMER });
});

// POST /api/symptoms/check
// Body: { selectedSymptoms: ["fever", "cough", ...], save: true|false }
// When save === true the result is also written to medical_history.
router.post("/check", async (req, res) => {
  const { selectedSymptoms, save } = req.body;

  if (!Array.isArray(selectedSymptoms) || selectedSymptoms.length === 0) {
    return res.status(400).json({ message: "Please select at least one symptom." });
  }

  const matches = analyzeSymptoms(selectedSymptoms);

  // Optionally persist to medical_history so it appears in the timeline.
  let savedEntry = null;
  if (save === true) {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    const notes = buildHistorySummary(selectedSymptoms, matches);
    const problems = selectedSymptoms
      .map((id) => {
        const s = SYMPTOMS.find((x) => x.id === id);
        return s ? s.label : id;
      })
      .join(", ");

    const topCondition = matches.length > 0 ? matches[0].condition : "Symptom check";
    const urgency = matches.length > 0 ? matches[0].urgency : null;

    const doc = await MedicalHistory.create({
      userId: req.userId,
      diseaseName: urgency ? `Symptom Check — ${topCondition} [${urgency} urgency]` : "Symptom Check",
      problems,          // store selected symptom labels in the "problems" field
      medicines: null,  // not applicable here
      allergies: null,  // not applicable here
      notes,             // full summary goes in notes
      recordDate: date,
      recordTime: time,
    });

    savedEntry = { id: doc._id, date, time };
  }

  res.json({ matches, savedEntry, disclaimer: DISCLAIMER });
});

module.exports = router;
