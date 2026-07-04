// utils/symptomLogic.js
// ---------------------------------------------------------------
// Rule-based symptom checker.
// The same design pattern as healthLogic.js: pure functions with
// no side-effects so they are easy to read, test, and expand.
// ---------------------------------------------------------------

// ── SYMPTOM CATALOGUE ──────────────────────────────────────────
// Each symptom has a unique ID (used by rules), a label (shown in
// the checklist UI), and a category (used to group checkboxes).

const SYMPTOMS = [
  // General
  { id: "fever",           label: "Fever / high temperature",       category: "General" },
  { id: "chills",          label: "Chills or shivering",            category: "General" },
  { id: "fatigue",         label: "Fatigue or tiredness",           category: "General" },
  { id: "weakness",        label: "Weakness / low energy",          category: "General" },
  { id: "loss_of_appetite",label: "Loss of appetite",               category: "General" },
  { id: "night_sweats",    label: "Night sweats",                   category: "General" },

  // Head & Throat
  { id: "headache",        label: "Headache",                       category: "Head & Throat" },
  { id: "sore_throat",     label: "Sore throat",                    category: "Head & Throat" },
  { id: "runny_nose",      label: "Runny nose",                     category: "Head & Throat" },
  { id: "nasal_congestion",label: "Nasal congestion / stuffiness",  category: "Head & Throat" },
  { id: "loss_of_smell",   label: "Loss of smell or taste",         category: "Head & Throat" },
  { id: "ear_pain",        label: "Ear pain",                       category: "Head & Throat" },

  // Respiratory
  { id: "cough",           label: "Cough (dry or wet)",             category: "Respiratory" },
  { id: "shortness_of_breath", label: "Shortness of breath",        category: "Respiratory" },
  { id: "chest_tightness", label: "Chest tightness",                category: "Respiratory" },
  { id: "wheezing",        label: "Wheezing",                       category: "Respiratory" },

  // Digestive
  { id: "nausea",          label: "Nausea",                         category: "Digestive" },
  { id: "vomiting",        label: "Vomiting",                       category: "Digestive" },
  { id: "diarrhea",        label: "Diarrhea",                       category: "Digestive" },
  { id: "stomach_pain",    label: "Stomach / abdominal pain",       category: "Digestive" },
  { id: "bloating",        label: "Bloating or gas",                category: "Digestive" },

  // Musculoskeletal
  { id: "body_aches",      label: "Body aches or muscle pain",      category: "Musculoskeletal" },
  { id: "joint_pain",      label: "Joint pain or swollen joints",   category: "Musculoskeletal" },
  { id: "back_pain",       label: "Back pain",                      category: "Musculoskeletal" },
  { id: "neck_stiffness",  label: "Neck stiffness",                 category: "Musculoskeletal" },
  { id: "muscle_cramps",   label: "Muscle cramps",                  category: "Musculoskeletal" },

  // Neurological
  { id: "dizziness",           label: "Dizziness or lightheadedness", category: "Neurological" },
  { id: "blurred_vision",      label: "Blurred or double vision",      category: "Neurological" },
  { id: "confusion",           label: "Confusion or difficulty thinking", category: "Neurological" },
  { id: "numbness",            label: "Numbness or tingling",          category: "Neurological" },
  { id: "sensitivity_to_light",label: "Sensitivity to light",          category: "Neurological" },

  // Skin
  { id: "rash",            label: "Skin rash",                      category: "Skin" },
  { id: "itching",         label: "Itching",                        category: "Skin" },
  { id: "swelling",        label: "Swelling (face, lips, or body)", category: "Skin" },
  { id: "yellowing_skin",  label: "Yellowing of skin or eyes",      category: "Skin" },

  // Cardiac
  { id: "chest_pain",      label: "Chest pain or pressure",         category: "Cardiac" },
  { id: "palpitations",    label: "Heart palpitations / racing heart", category: "Cardiac" },
];

// ── CONDITION RULES ────────────────────────────────────────────
// Each rule has:
//   condition  — human-readable condition name
//   symptoms   — list of symptom IDs associated with this condition
//   minMatch   — how many of those symptoms must be selected to trigger
//   urgency    — "low" | "medium" | "high"
//   advice     — list of plain-language guidance strings

const RULES = [
  {
    condition: "Common Cold",
    symptoms: ["runny_nose", "sore_throat", "cough", "nasal_congestion", "fatigue"],
    minMatch: 2,
    urgency: "low",
    advice: [
      "Rest as much as possible and stay well hydrated.",
      "Over-the-counter cold remedies may help relieve symptoms.",
      "Symptoms typically resolve within 7–10 days.",
    ],
  },
  {
    condition: "Influenza (Flu)",
    symptoms: ["fever", "body_aches", "fatigue", "headache", "chills", "cough"],
    minMatch: 3,
    urgency: "medium",
    advice: [
      "Rest at home and drink plenty of fluids.",
      "Antiviral medication is most effective within the first 48 hours — consult a doctor.",
      "Monitor your temperature. If it rises above 39.5°C or symptoms worsen, seek medical care.",
    ],
  },
  {
    condition: "Possible COVID-19 / Viral Illness",
    symptoms: ["fever", "cough", "loss_of_smell", "fatigue", "shortness_of_breath", "body_aches"],
    minMatch: 2,
    urgency: "medium",
    advice: [
      "Consider taking a COVID-19 rapid test if available.",
      "Stay home and isolate to protect others until you know what you have.",
      "Seek medical advice if breathing becomes difficult or symptoms are severe.",
    ],
  },
  {
    condition: "Throat / Tonsil Infection",
    symptoms: ["sore_throat", "fever", "headache", "fatigue", "ear_pain"],
    minMatch: 3,
    urgency: "medium",
    advice: [
      "Gargle with warm salt water for temporary relief.",
      "If you have white patches on your tonsils or fever above 38.5°C, see a doctor — you may need antibiotics.",
      "Drink warm liquids and rest.",
    ],
  },
  {
    condition: "Gastroenteritis (Stomach Bug)",
    symptoms: ["nausea", "vomiting", "diarrhea", "stomach_pain", "fatigue"],
    minMatch: 2,
    urgency: "medium",
    advice: [
      "Drink clear fluids in small sips to stay hydrated — oral rehydration salts can help.",
      "Avoid solid food until vomiting stops, then reintroduce bland foods slowly.",
      "Seek medical attention if symptoms last more than 3 days or you see blood.",
    ],
  },
  {
    condition: "Food Poisoning",
    symptoms: ["nausea", "vomiting", "diarrhea", "stomach_pain", "fever", "chills"],
    minMatch: 3,
    urgency: "medium",
    advice: [
      "Stop eating and focus on rehydrating with water or oral rehydration solution.",
      "Identify the suspected food and avoid sharing it with others.",
      "If symptoms are severe or last more than 24 hours, consult a doctor.",
    ],
  },
  {
    condition: "Allergic Reaction",
    symptoms: ["rash", "itching", "runny_nose", "sneezing", "watery_eyes"],
    minMatch: 2,
    urgency: "low",
    advice: [
      "Try to identify and avoid the trigger (food, pet, pollen, medication, etc.).",
      "Antihistamines available over the counter often relieve mild symptoms.",
      "See a doctor for recurring allergies or to discuss long-term management.",
    ],
  },
  {
    condition: "Severe Allergic Reaction (Possible Anaphylaxis)",
    symptoms: ["rash", "swelling", "shortness_of_breath", "chest_tightness"],
    minMatch: 3,
    urgency: "high",
    advice: [
      "This is a medical emergency. Call emergency services immediately.",
      "If an EpiPen (epinephrine auto-injector) is available and prescribed, use it now.",
      "Do not eat or drink anything. Lie down with legs raised unless breathing is difficult.",
    ],
  },
  {
    condition: "Migraine",
    symptoms: ["headache", "nausea", "blurred_vision", "sensitivity_to_light", "vomiting"],
    minMatch: 2,
    urgency: "medium",
    advice: [
      "Rest in a quiet, dark room.",
      "Pain relievers (ibuprofen or paracetamol) taken early often help.",
      "Keep a headache diary to identify triggers. Consult a doctor if migraines are frequent.",
    ],
  },
  {
    condition: "Possible Hypertension Symptoms",
    symptoms: ["headache", "dizziness", "blurred_vision", "palpitations", "chest_tightness"],
    minMatch: 2,
    urgency: "medium",
    advice: [
      "Check your blood pressure using the Blood Pressure module if you haven't recently.",
      "Reduce salt, stress, and caffeine intake.",
      "Consult a doctor — persistent high blood pressure needs medical management.",
    ],
  },
  {
    condition: "Possible Cardiac Emergency",
    symptoms: ["chest_pain", "shortness_of_breath", "palpitations", "numbness", "dizziness"],
    minMatch: 2,
    urgency: "high",
    advice: [
      "Call emergency services (e.g. 999 or 112) immediately — do not drive yourself.",
      "Chew one regular aspirin (325 mg) if available and you are not allergic.",
      "Loosen tight clothing and sit or lie in a comfortable position. Stay calm.",
    ],
  },
  {
    condition: "Possible Meningitis",
    symptoms: ["fever", "neck_stiffness", "headache", "confusion", "sensitivity_to_light"],
    minMatch: 3,
    urgency: "high",
    advice: [
      "Meningitis can be life-threatening. Go to an emergency room immediately.",
      "Do not wait for a rash to develop — not all cases produce a rash.",
      "This condition can worsen very rapidly; urgent treatment is critical.",
    ],
  },
  {
    condition: "Dehydration",
    symptoms: ["dizziness", "fatigue", "weakness", "headache", "loss_of_appetite"],
    minMatch: 2,
    urgency: "low",
    advice: [
      "Drink water steadily throughout the day — at least 8 glasses (2 litres).",
      "Oral rehydration salts (ORS) can restore electrolytes quickly.",
      "Seek medical help if you are unable to keep fluids down or feel very unwell.",
    ],
  },
  {
    condition: "Respiratory Infection (Possible Pneumonia / Bronchitis)",
    symptoms: ["cough", "fever", "shortness_of_breath", "chest_tightness", "fatigue", "wheezing"],
    minMatch: 2,
    urgency: "medium",
    advice: [
      "Rest and drink plenty of warm fluids.",
      "If you have a high fever or difficulty breathing, see a doctor promptly.",
      "Do not ignore a cough that produces coloured mucus for more than a week.",
    ],
  },
  {
    condition: "Asthma / Breathing Difficulty",
    symptoms: ["wheezing", "shortness_of_breath", "chest_tightness", "cough"],
    minMatch: 2,
    urgency: "medium",
    advice: [
      "Use your prescribed reliever inhaler (blue) if you have one.",
      "Sit upright and try to stay calm — anxiety makes breathing harder.",
      "If symptoms don't improve within 10 minutes, seek emergency medical help.",
    ],
  },
  {
    condition: "Possible Liver Issue (Hepatitis Warning)",
    symptoms: ["yellowing_skin", "fatigue", "nausea", "stomach_pain", "loss_of_appetite"],
    minMatch: 3,
    urgency: "high",
    advice: [
      "Yellowing of skin or eyes (jaundice) requires prompt medical evaluation.",
      "Avoid alcohol and any non-essential medications until reviewed by a doctor.",
      "This symptom combination warrants urgent blood tests.",
    ],
  },
  {
    condition: "Possible Anxiety / Stress Response",
    symptoms: ["palpitations", "dizziness", "shortness_of_breath", "fatigue", "headache", "chest_tightness"],
    minMatch: 3,
    urgency: "low",
    advice: [
      "Try slow, deep breathing: inhale for 4 counts, hold for 4, exhale for 6.",
      "Reduce caffeine and screen time before bed. Prioritise sleep.",
      "If episodes are frequent or affect daily life, speak with a healthcare professional.",
    ],
  },
  {
    condition: "Possible Urinary / Kidney Infection",
    symptoms: ["back_pain", "fever", "fatigue", "chills"],
    minMatch: 3,
    urgency: "medium",
    advice: [
      "Drink plenty of water to help flush the kidneys.",
      "Kidney infections (pyelonephritis) need antibiotic treatment — see a doctor.",
      "Do not delay treatment; untreated kidney infections can become serious.",
    ],
  },
  {
    condition: "Possible Anaemia",
    symptoms: ["fatigue", "weakness", "dizziness", "shortness_of_breath", "loss_of_appetite"],
    minMatch: 3,
    urgency: "medium",
    advice: [
      "Eat iron-rich foods: red meat, lentils, spinach, fortified cereals.",
      "A simple blood test can confirm anaemia — ask your doctor.",
      "Vitamin B12 and folate deficiencies cause similar symptoms and are also treatable.",
    ],
  },
  {
    condition: "Ear Infection",
    symptoms: ["ear_pain", "fever", "headache", "loss_of_appetite"],
    minMatch: 2,
    urgency: "low",
    advice: [
      "Apply a warm cloth to the ear for comfort.",
      "See a doctor if the pain is severe or you notice discharge from the ear.",
      "Do not insert anything into the ear canal.",
    ],
  },
  {
    condition: "Muscle Strain / Overexertion",
    symptoms: ["body_aches", "muscle_cramps", "joint_pain", "back_pain", "fatigue"],
    minMatch: 2,
    urgency: "low",
    advice: [
      "Rest the affected muscles and apply an ice pack (wrapped in cloth) for 20 minutes.",
      "Over-the-counter anti-inflammatory medication (e.g. ibuprofen) can help with swelling.",
      "Gentle stretching after 48 hours can aid recovery.",
    ],
  },
];

// ── MATCHING FUNCTION ──────────────────────────────────────────
// Takes an array of selected symptom IDs, returns matched conditions
// sorted by urgency (high first) then by number of matching symptoms.

function analyzeSymptoms(selectedIds) {
  const selectedSet = new Set(selectedIds);
  const urgencyOrder = { high: 0, medium: 1, low: 2 };

  const matches = RULES
    .map((rule) => {
      const matchCount = rule.symptoms.filter((s) => selectedSet.has(s)).length;
      return { ...rule, matchCount };
    })
    .filter((r) => r.matchCount >= r.minMatch)
    .sort((a, b) => {
      // Primary sort: urgency (high → medium → low)
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      // Secondary sort: more matching symptoms = more relevant
      return b.matchCount - a.matchCount;
    });

  return matches;
}

// Build a tidy summary string for saving to medical history.
function buildHistorySummary(selectedIds, matches) {
  const selectedLabels = selectedIds.map((id) => {
    const s = SYMPTOMS.find((x) => x.id === id);
    return s ? s.label : id;
  });

  const conditionLines = matches
    .map((m) => `${m.condition} [${m.urgency} urgency]`)
    .join("; ");

  return (
    `Selected symptoms: ${selectedLabels.join(", ")}. ` +
    (conditionLines ? `Possible conditions: ${conditionLines}.` : "No specific conditions matched.")
  );
}

const DISCLAIMER =
  "This system provides general health guidance and does not replace professional medical advice.";

module.exports = { SYMPTOMS, RULES, analyzeSymptoms, buildHistorySummary, DISCLAIMER };
