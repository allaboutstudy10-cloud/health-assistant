/* js/symptom-checker.js */
requireLogin();

// ── BOILERPLATE (same pattern as every other app page) ──────────
document.getElementById("openSidebar")?.addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

function syncThemeIcon() {
  const icon = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
  document.getElementById("themeToggle").textContent = icon;
  document.getElementById("themeToggleDesktop").textContent = icon;
}
syncThemeIcon();
[document.getElementById("themeToggle"), document.getElementById("themeToggleDesktop")].forEach((btn) =>
  btn.addEventListener("click", () => {
    toggleTheme();
    syncThemeIcon();
  })
);
document.getElementById("logoutBtn").addEventListener("click", logout);

// ── STATE ────────────────────────────────────────────────────────
let allSymptoms   = [];   // full catalogue from the server
let lastMatches   = [];   // result of the last analysis (for saving)
let lastSelected  = [];   // selected symptom IDs of the last analysis

// ── STEP 1: LOAD SYMPTOM CATALOGUE & BUILD CHECKLIST ─────────────
async function loadSymptoms() {
  try {
    const data = await apiRequest("/symptoms/list");
    allSymptoms = data.symptoms;
    document.getElementById("disclaimerResult").textContent = data.disclaimer;
    buildChecklist(allSymptoms);
  } catch (err) {
    showToast("Could not load symptoms: " + err.message, "error");
  }
}

// Group symptoms by category, then render one chip per symptom.
function buildChecklist(symptoms) {
  const container = document.getElementById("symptomChecklist");

  // Build a map of category → symptoms
  const byCategory = {};
  symptoms.forEach((s) => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  });

  container.innerHTML = Object.entries(byCategory)
    .map(([category, items]) => `
      <div class="symptom-category">
        <h4>${category}</h4>
        <div class="symptom-grid">
          ${items
            .map(
              (s) => `
            <label class="symptom-chip" id="chip-${s.id}">
              <input type="checkbox" value="${s.id}" class="symptom-checkbox" />
              ${s.label}
            </label>`
            )
            .join("")}
        </div>
      </div>
    `)
    .join("");

  // Wire up every checkbox so the chip reflects checked state and
  // the counter stays up to date.
  container.querySelectorAll(".symptom-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => {
      const chip = cb.closest(".symptom-chip");
      chip.classList.toggle("selected", cb.checked);
      updateCounter();
    });
  });
}

function getSelectedIds() {
  return Array.from(
    document.querySelectorAll(".symptom-checkbox:checked")
  ).map((cb) => cb.value);
}

function updateCounter() {
  const count = getSelectedIds().length;
  document.getElementById("selectedCount").textContent =
    count === 0 ? "0 selected" : `${count} selected`;
  document.getElementById("analyseBtn").disabled = count === 0;
}

// ── STEP 2: CLEAR ALL ────────────────────────────────────────────
document.getElementById("clearBtn").addEventListener("click", () => {
  document.querySelectorAll(".symptom-checkbox").forEach((cb) => {
    cb.checked = false;
    cb.closest(".symptom-chip").classList.remove("selected");
  });
  updateCounter();
  // Hide results, show the placeholder
  document.getElementById("resultsPanel").classList.remove("visible");
  document.getElementById("emptyResults").style.display = "block";
});

// ── STEP 3: ANALYSE ──────────────────────────────────────────────
document.getElementById("analyseBtn").addEventListener("click", async () => {
  const selected = getSelectedIds();
  if (selected.length === 0) {
    showToast("Please select at least one symptom.", "error");
    return;
  }

  const btn = document.getElementById("analyseBtn");
  btn.disabled = true;
  btn.textContent = "Analysing...";

  try {
    // send save: false — the user will decide whether to save after
    // seeing the results.
    const data = await apiRequest("/symptoms/check", {
      method: "POST",
      body: { selectedSymptoms: selected, save: false },
    });

    lastMatches  = data.matches;
    lastSelected = selected;

    renderResults(data.matches, data.disclaimer);
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Analyse symptoms";
  }
});

// ── STEP 4: RENDER RESULTS ────────────────────────────────────────
function renderResults(matches, disclaimer) {
  // Show results, hide placeholder
  document.getElementById("emptyResults").style.display = "none";
  document.getElementById("resultsPanel").classList.add("visible");

  // Reset save button state for the new result set
  document.getElementById("savedConfirm").style.display = "none";
  document.getElementById("saveBtn").disabled = false;
  document.getElementById("saveBtn").textContent = "Save to Medical History";

  // Emergency banner — only if at least one high-urgency match
  const hasEmergency = matches.some((m) => m.urgency === "high");
  document.getElementById("emergencyBanner").style.display =
    hasEmergency ? "flex" : "none";

  // Match cards
  const matchList = document.getElementById("matchList");
  if (matches.length === 0) {
    matchList.innerHTML = "";
    document.getElementById("noMatchCard").style.display = "block";
  } else {
    document.getElementById("noMatchCard").style.display = "none";
    matchList.innerHTML = matches
      .map(
        (m) => `
      <div class="match-card urgency-${m.urgency}">
        <div class="match-head">
          <h4>${m.condition}</h4>
          <span class="urgency-tag ${m.urgency}">${urgencyLabel(m.urgency)}</span>
        </div>
        <ul class="advice-list">
          ${m.advice.map((tip) => `<li>${tip}</li>`).join("")}
        </ul>
      </div>`
      )
      .join("");
  }

  // Scroll results into view on mobile
  document.getElementById("resultsPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function urgencyLabel(urgency) {
  return {
    high:   "⚠ Seek immediate help",
    medium: "See a doctor soon",
    low:    "Self-care recommended",
  }[urgency] || urgency;
}

// ── STEP 5: SAVE TO MEDICAL HISTORY ─────────────────────────────
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (lastSelected.length === 0) return;

  const btn = document.getElementById("saveBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";

  try {
    await apiRequest("/symptoms/check", {
      method: "POST",
      body: { selectedSymptoms: lastSelected, save: true },
    });

    btn.style.display = "none";
    const confirm = document.getElementById("savedConfirm");
    confirm.style.display = "inline";
    showToast("Symptom check saved to Medical History.", "success");
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Save to Medical History";
    showToast(err.message, "error");
  }
});

// ── BOOT ─────────────────────────────────────────────────────────
loadSymptoms();
