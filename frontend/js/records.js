/* js/records.js */
requireLogin();

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

/* ===================== TABS ===================== */

const tabButtons = document.querySelectorAll(".tab-btn");
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
  });
});

// Open the Medical History tab directly if the page was linked with #history
if (window.location.hash === "#history") {
  document.querySelector('.tab-btn[data-tab="history"]').click();
}

/* ===================== STATE (cached for search) ===================== */

let bmiData = [];
let tempData = [];
let bpData = [];
let historyData = [];

/* ===================== BMI ===================== */

document.getElementById("bmiForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await apiRequest("/health/bmi", {
      method: "POST",
      body: {
        weight: document.getElementById("bmiWeight").value,
        height: document.getElementById("bmiHeight").value,
      },
    });
    showToast("BMI reading saved.");
    e.target.reset();
    loadBmi();
  } catch (err) {
    showToast(err.message, "error");
  }
});

async function loadBmi() {
  bmiData = await apiRequest("/health/bmi");
  renderBmiTable(bmiData);
  renderChart("bmiChart", bmiData, "bmi", "BMI");
}

function renderBmiTable(rows) {
  const body = document.getElementById("bmiTableBody");
  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="icon">📊</div>No BMI records yet.</div></td></tr>`;
    return;
  }
  body.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>${r.bmi}</td>
      <td><span class="badge ${statusClass(r.category)}">${r.category}</span></td>
      <td>${formatDate(r.record_date, r.record_time)}</td>
      <td><button class="btn btn-danger btn-sm" data-delete-bmi="${r.id}">Delete</button></td>
    </tr>`
    )
    .join("");

  body.querySelectorAll("[data-delete-bmi]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this BMI record?")) return;
      await apiRequest(`/health/bmi/${btn.dataset.deleteBmi}`, { method: "DELETE" });
      showToast("Record deleted.");
      loadBmi();
    })
  );
}

/* ===================== TEMPERATURE ===================== */

document.getElementById("tempForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await apiRequest("/health/temperature", {
      method: "POST",
      body: { temperature: document.getElementById("tempValue").value },
    });
    showToast("Temperature reading saved.");
    e.target.reset();
    loadTemp();
  } catch (err) {
    showToast(err.message, "error");
  }
});

async function loadTemp() {
  tempData = await apiRequest("/health/temperature");
  renderTempTable(tempData);
  renderChart("tempChart", tempData, "temperature", "Temperature (°C)");
}

function renderTempTable(rows) {
  const body = document.getElementById("tempTableBody");
  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="icon">🌡️</div>No temperature records yet.</div></td></tr>`;
    return;
  }
  body.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>${r.temperature}°C</td>
      <td><span class="badge ${statusClass(r.status)}">${r.status}</span></td>
      <td>${formatDate(r.record_date, r.record_time)}</td>
      <td><button class="btn btn-danger btn-sm" data-delete-temp="${r.id}">Delete</button></td>
    </tr>`
    )
    .join("");

  body.querySelectorAll("[data-delete-temp]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this temperature record?")) return;
      await apiRequest(`/health/temperature/${btn.dataset.deleteTemp}`, { method: "DELETE" });
      showToast("Record deleted.");
      loadTemp();
    })
  );
}

/* ===================== BLOOD PRESSURE ===================== */

document.getElementById("bpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await apiRequest("/health/bp", {
      method: "POST",
      body: {
        systolic: document.getElementById("bpSys").value,
        diastolic: document.getElementById("bpDia").value,
      },
    });
    showToast("Blood pressure reading saved.");
    e.target.reset();
    loadBp();
  } catch (err) {
    showToast(err.message, "error");
  }
});

async function loadBp() {
  bpData = await apiRequest("/health/bp");
  renderBpTable(bpData);
  renderChart("bpChart", bpData, "systolic", "Systolic (mmHg)", "diastolic", "Diastolic (mmHg)");
}

function renderBpTable(rows) {
  const body = document.getElementById("bpTableBody");
  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="icon">❤️</div>No blood pressure records yet.</div></td></tr>`;
    return;
  }
  body.innerHTML = rows
    .map(
      (r) => `
    <tr>
      <td>${r.systolic}/${r.diastolic}</td>
      <td><span class="badge ${statusClass(r.status)}">${r.status}</span></td>
      <td>${formatDate(r.record_date, r.record_time)}</td>
      <td><button class="btn btn-danger btn-sm" data-delete-bp="${r.id}">Delete</button></td>
    </tr>`
    )
    .join("");

  body.querySelectorAll("[data-delete-bp]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this blood pressure record?")) return;
      await apiRequest(`/health/bp/${btn.dataset.deleteBp}`, { method: "DELETE" });
      showToast("Record deleted.");
      loadBp();
    })
  );
}

/* ===================== CHART HELPER (shared by BMI/Temp/BP) ===================== */

const chartInstances = {};

function renderChart(canvasId, rows, field, label, field2, label2) {
  const ordered = [...rows].reverse(); // oldest -> newest, left to right
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

  const datasets = [
    {
      label,
      data: ordered.map((r) => r[field]),
      borderColor: "#0e7c86",
      backgroundColor: "rgba(14,124,134,0.12)",
      tension: 0.35,
      fill: !field2,
      pointRadius: 4,
    },
  ];

  if (field2) {
    datasets.push({
      label: label2,
      data: ordered.map((r) => r[field2]),
      borderColor: "#ff6b5b",
      backgroundColor: "rgba(255,107,91,0.1)",
      tension: 0.35,
      fill: false,
      pointRadius: 4,
    });
  }

  chartInstances[canvasId] = new Chart(ctx, {
    type: "line",
    data: {
      labels: ordered.map((r) => formatDate(r.record_date, null)),
      datasets,
    },
    options: {
      responsive: true,
      plugins: { legend: { display: !!field2 } },
    },
  });
}

/* ===================== MEDICAL HISTORY (timeline + modal CRUD) ===================== */

const historyModal = document.getElementById("historyModal");
const historyForm = document.getElementById("historyForm");

document.getElementById("addHistoryBtn").addEventListener("click", () => openHistoryModal());
document.getElementById("closeHistoryModal").addEventListener("click", closeHistoryModal);
historyModal.addEventListener("click", (e) => {
  if (e.target === historyModal) closeHistoryModal();
});

function openHistoryModal(entry = null) {
  document.getElementById("historyModalTitle").textContent = entry ? "Edit medical history entry" : "Add medical history entry";
  document.getElementById("historyId").value = entry ? entry.id : "";
  document.getElementById("diseaseName").value = entry ? entry.disease_name || "" : "";
  document.getElementById("problems").value = entry ? entry.problems || "" : "";
  document.getElementById("medicines").value = entry ? entry.medicines || "" : "";
  document.getElementById("allergies").value = entry ? entry.allergies || "" : "";
  document.getElementById("notes").value = entry ? entry.notes || "" : "";
  historyModal.classList.add("open");
}

function closeHistoryModal() {
  historyModal.classList.remove("open");
  historyForm.reset();
}

historyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("historyId").value;
  const payload = {
    diseaseName: document.getElementById("diseaseName").value.trim(),
    problems: document.getElementById("problems").value.trim(),
    medicines: document.getElementById("medicines").value.trim(),
    allergies: document.getElementById("allergies").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };

  try {
    if (id) {
      await apiRequest(`/history/${id}`, { method: "PUT", body: payload });
      showToast("Entry updated.");
    } else {
      await apiRequest("/history", { method: "POST", body: payload });
      showToast("Entry added.");
    }
    closeHistoryModal();
    loadHistory();
  } catch (err) {
    showToast(err.message, "error");
  }
});

async function loadHistory() {
  historyData = await apiRequest("/history");
  renderHistoryTimeline(historyData);
}

function renderHistoryTimeline(rows) {
  const timeline = document.getElementById("historyTimeline");
  if (rows.length === 0) {
    timeline.innerHTML = `<div class="empty-state"><div class="icon">🗂️</div>No medical history yet. Add your first entry.</div>`;
    return;
  }

  timeline.innerHTML = rows
    .map(
      (r) => `
    <div class="timeline-item">
      <div class="t-date">${formatDate(r.record_date, r.record_time)}</div>
      <div class="t-card">
        <h4>${r.disease_name || "Health event"}</h4>
        ${r.problems ? `<p><strong>Problems:</strong> ${r.problems}</p>` : ""}
        ${r.medicines ? `<p><strong>Medicines:</strong> ${r.medicines}</p>` : ""}
        ${r.allergies ? `<p><strong>Allergies:</strong> ${r.allergies}</p>` : ""}
        ${r.notes ? `<p class="t-meta">${r.notes}</p>` : ""}
        <div class="row-actions" style="margin-top:10px;">
          <button class="btn btn-outline btn-sm" data-edit-history="${r.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-delete-history="${r.id}">Delete</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  timeline.querySelectorAll("[data-edit-history]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const entry = historyData.find((h) => h.id == btn.dataset.editHistory);
      openHistoryModal(entry);
    })
  );

  timeline.querySelectorAll("[data-delete-history]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this medical history entry?")) return;
      await apiRequest(`/history/${btn.dataset.deleteHistory}`, { method: "DELETE" });
      showToast("Entry deleted.");
      loadHistory();
    })
  );
}

/* ===================== SEARCH ===================== */
// Filters whichever tab is currently visible: BMI/Temp/BP tables by
// category/status text, or the medical history timeline by any field.

document.getElementById("searchInput").addEventListener("input", (e) => {
  const term = e.target.value.trim().toLowerCase();
  const activeTab = document.querySelector(".tab-btn.active").dataset.tab;

  if (activeTab === "bmi") {
    renderBmiTable(bmiData.filter((r) => r.category.toLowerCase().includes(term) || String(r.bmi).includes(term)));
  } else if (activeTab === "temperature") {
    renderTempTable(tempData.filter((r) => r.status.toLowerCase().includes(term) || String(r.temperature).includes(term)));
  } else if (activeTab === "bp") {
    renderBpTable(bpData.filter((r) => r.status.toLowerCase().includes(term) || `${r.systolic}/${r.diastolic}`.includes(term)));
  } else if (activeTab === "history") {
    renderHistoryTimeline(
      historyData.filter((r) =>
        [r.disease_name, r.problems, r.medicines, r.allergies, r.notes].join(" ").toLowerCase().includes(term)
      )
    );
  }
});

/* ===================== INITIAL LOAD ===================== */

loadBmi();
loadTemp();
loadBp();
loadHistory();
