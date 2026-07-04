/* js/dashboard.js */
requireLogin();

// Sidebar toggle for mobile
document.getElementById("openSidebar")?.addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// Dark mode toggle (two buttons: mobile topbar + desktop topbar)
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

document.getElementById("todayDate").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

function vitalCardHTML(label, value, unit, status) {
  const cls = statusClass(status);
  return `
    <div class="vital-card status-${cls}">
      <div class="vital-label">${label}</div>
      <div class="vital-value">${value}<span class="unit"> ${unit}</span></div>
      <div class="vital-status">${status || "No data yet"}</div>
    </div>
  `;
}

async function loadDashboard() {
  try {
    const data = await apiRequest("/dashboard");
    const user = getStoredUser();

    document.getElementById("userName").textContent = (data.user.fullName || user?.fullName || "there").split(" ")[0];
    document.getElementById("ageStat").textContent = data.user.age || "—";

    // Top summary cards
    document.getElementById("bmiStat").textContent = data.latestBmi ? data.latestBmi.bmi : "—";
    document.getElementById("bmiCategoryStat").textContent = data.latestBmi ? data.latestBmi.category : "No BMI logged yet";

    document.getElementById("tempStat").textContent = data.latestTemp ? data.latestTemp.temperature + "°C" : "—";
    document.getElementById("tempStatusStat").textContent = data.latestTemp ? data.latestTemp.status : "No temperature logged yet";

    document.getElementById("bpStat").textContent = data.latestBp ? `${data.latestBp.systolic}/${data.latestBp.diastolic}` : "—";
    document.getElementById("bpStatusStat").textContent = data.latestBp ? data.latestBp.status : "No BP logged yet";

    // Vitals cards
    const vitalsArea = document.getElementById("vitalsArea");
    vitalsArea.innerHTML =
      vitalCardHTML("BMI", data.latestBmi ? data.latestBmi.bmi : "—", "", data.latestBmi ? data.latestBmi.category : null) +
      vitalCardHTML("Temperature", data.latestTemp ? data.latestTemp.temperature : "—", "°C", data.latestTemp ? data.latestTemp.status : null) +
      vitalCardHTML("Blood Pressure", data.latestBp ? `${data.latestBp.systolic}/${data.latestBp.diastolic}` : "—", "mmHg", data.latestBp ? data.latestBp.status : null);

    // Recent records table
    const body = document.getElementById("recentRecordsBody");
    if (data.recentRecords.length === 0) {
      body.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="icon">🗒️</div>No records yet. Start by adding a reading.</div></td></tr>`;
    } else {
      body.innerHTML = data.recentRecords
        .map(
          (r) => `
        <tr>
          <td>${r.type}</td>
          <td>${r.value}</td>
          <td><span class="badge ${statusClass(r.status)}">${r.status}</span></td>
          <td>${formatDate(r.record_date, r.record_time)}</td>
        </tr>`
        )
        .join("");
    }

    // Status summary
    const statusSummary = document.getElementById("statusSummary");
    const summaryItems = [
      data.latestBmi && { label: "BMI", status: data.latestBmi.category },
      data.latestTemp && { label: "Temperature", status: data.latestTemp.status },
      data.latestBp && { label: "Blood pressure", status: data.latestBp.status },
    ].filter(Boolean);

    statusSummary.innerHTML = summaryItems.length
      ? summaryItems
          .map(
            (item) => `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${item.label}</span>
          <span class="badge ${statusClass(item.status)}">${item.status}</span>
        </div>`
          )
          .join("")
      : `<p style="color:var(--muted); font-size:0.9rem;">Add a reading to see your health status here.</p>`;

    // Recommendations
    document.getElementById("recommendList").innerHTML = data.recommendations
      .map((tip) => `<li>💡 ${tip}</li>`)
      .join("");
    document.getElementById("disclaimerText").textContent = data.disclaimer;

    drawBmiChart();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function drawBmiChart() {
  try {
    const records = await apiRequest("/health/bmi");
    const ordered = [...records].reverse(); // oldest -> newest
    const ctx = document.getElementById("bmiChart");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ordered.map((r) => formatDate(r.record_date, null)),
        datasets: [
          {
            label: "BMI",
            data: ordered.map((r) => r.bmi),
            borderColor: "#0e7c86",
            backgroundColor: "rgba(14,124,134,0.12)",
            tension: 0.35,
            fill: true,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { suggestedMin: 14, suggestedMax: 35 } },
      },
    });
  } catch (err) {
    // silently ignore chart errors so the rest of the dashboard still works
    console.error(err);
  }
}

loadDashboard();
