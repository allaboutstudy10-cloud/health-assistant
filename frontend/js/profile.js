/* js/profile.js */
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

// Reminder checkboxes are saved locally — a lightweight version of a
// reminder feature without needing a notifications backend.
["remBmi", "remBp", "remCheckup"].forEach((id) => {
  const checkbox = document.getElementById(id);
  checkbox.checked = localStorage.getItem("ha_" + id) === "true";
  checkbox.addEventListener("change", () => localStorage.setItem("ha_" + id, checkbox.checked));
});

async function loadProfile() {
  try {
    const user = await apiRequest("/profile");

    document.getElementById("profileName").textContent = user.fullName;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("avatarInitial").textContent = (user.fullName || "?").charAt(0).toUpperCase();

    document.getElementById("fullName").value = user.fullName || "";
    document.getElementById("age").value = user.age || "";
    document.getElementById("gender").value = user.gender || "";
    document.getElementById("height").value = user.height || "";
    document.getElementById("weight").value = user.weight || "";

    document.getElementById("memberSince").textContent = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : "—";

    if (user.height && user.weight) {
      const heightM = user.height / 100;
      const fallbackBmi = (user.weight / (heightM * heightM)).toFixed(1);
      document.getElementById("currentBmi").textContent = fallbackBmi;
    }

    // Prefer the most recently logged BMI record (matches Dashboard/Records)
    // over the static profile-based calculation above.
    try {
      const bmiRecords = await apiRequest("/health/bmi");
      if (bmiRecords.length > 0) {
        document.getElementById("currentBmi").textContent = bmiRecords[0].bmi;
      }
    } catch (err) {
      // If this secondary call fails, the fallback value above still shows.
      console.error(err);
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

const form = document.getElementById("profileForm");
const errorBox = document.getElementById("formError");
const successBox = document.getElementById("formSuccess");
const saveBtn = document.getElementById("saveBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.style.display = "none";
  successBox.style.display = "none";
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    await apiRequest("/profile", {
      method: "PUT",
      body: {
        fullName: document.getElementById("fullName").value.trim(),
        age: document.getElementById("age").value || null,
        gender: document.getElementById("gender").value || null,
        height: document.getElementById("height").value || null,
        weight: document.getElementById("weight").value || null,
        newPassword: document.getElementById("newPassword").value || null,
      },
    });

    successBox.textContent = "Profile updated successfully.";
    successBox.style.display = "block";
    document.getElementById("newPassword").value = "";
    showToast("Profile saved.");
    loadProfile();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = "block";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save changes";
  }
});

loadProfile();
