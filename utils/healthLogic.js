// utils/healthLogic.js
// Central place for all the "rules" that turn raw numbers into
// human-readable categories and advice. Keeping this logic in one
// file makes it easy to find and adjust later (e.g. if this project
// grows into an AI-powered system).

function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // round to 1 decimal place
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function getTemperatureStatus(tempCelsius) {
  // Standard thresholds for body temperature (Celsius)
  if (tempCelsius < 35) return "Below Normal (Hypothermia risk)";
  if (tempCelsius <= 37.5) return "Normal";
  if (tempCelsius <= 38.9) return "Possible Fever";
  return "High Fever";
}

function getBPStatus(systolic, diastolic) {
  if (systolic < 90 || diastolic < 60) return "Low Blood Pressure";
  if (systolic < 120 && diastolic < 80) return "Normal";
  if (systolic < 130 && diastolic < 80) return "Elevated";
  if (systolic < 140 || diastolic < 90) return "High Blood Pressure (Stage 1)";
  return "High Blood Pressure (Stage 2)";
}

// Builds a list of plain-language suggestions based on the user's
// most recent readings. Always includes the medical disclaimer.
function getRecommendations({ bmiCategory, tempStatus, bpStatus }) {
  const tips = [];

  if (bmiCategory === "Underweight") {
    tips.push("Your BMI is below the normal range. Consider a nutrient-rich diet and consult a doctor or dietitian.");
  } else if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
    tips.push("Try maintaining a balanced diet and regular physical activity.");
  }

  if (tempStatus && tempStatus.includes("Fever")) {
    tips.push("Monitor your symptoms and consider consulting a healthcare professional if needed.");
  } else if (tempStatus === "Below Normal (Hypothermia risk)") {
    tips.push("Your temperature reading is low. Keep warm and re-check; seek medical advice if it persists.");
  }

  if (bpStatus && bpStatus.includes("High")) {
    tips.push("Maintain a healthy lifestyle and consider medical consultation for your blood pressure.");
  } else if (bpStatus === "Low Blood Pressure") {
    tips.push("Stay hydrated and stand up slowly. Consult a doctor if you feel dizzy often.");
  } else if (bpStatus === "Elevated") {
    tips.push("Your blood pressure is slightly elevated. Reduce salt intake and monitor it regularly.");
  }

  if (tips.length === 0) {
    tips.push("Keep maintaining your healthy lifestyle.");
  }

  return tips;
}

const DISCLAIMER =
  "This system provides general health guidance and does not replace professional medical advice.";

module.exports = {
  calculateBMI,
  getBMICategory,
  getTemperatureStatus,
  getBPStatus,
  getRecommendations,
  DISCLAIMER,
};
