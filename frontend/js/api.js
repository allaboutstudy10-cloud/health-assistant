/* js/api.js
   Small set of shared helpers used by every page:
   - talking to the backend API
   - reading/writing the saved login token
   - showing toast messages
   - dark mode toggle
   These are plain functions (no framework) so the code stays easy
   to follow for a university project.
*/

const API_BASE = "/api";

// ---------- TOKEN / SESSION HELPERS ----------

function saveSession(token, user) {
  localStorage.setItem("ha_token", token);
  localStorage.setItem("ha_user", JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem("ha_token");
}

function getStoredUser() {
  const raw = localStorage.getItem("ha_user");
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem("ha_token");
  localStorage.removeItem("ha_user");
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

// Redirects to login if there is no token. Call this at the top of
// any page that requires the user to be logged in.
function requireLogin() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}

// ---------- API REQUEST WRAPPER ----------

async function apiRequest(path, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If the token is invalid/expired, send the user back to login
    if (response.status === 401 && auth) {
      clearSession();
      window.location.href = "login.html";
    }
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

// ---------- TOAST NOTIFICATIONS ----------

function showToast(message, type = "success") {
  let toast = document.getElementById("ha-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ha-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = "toast " + type;
  // Trigger the CSS transition
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// ---------- DARK MODE ----------

function applyStoredTheme() {
  const theme = localStorage.getItem("ha_theme") || "light";
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("ha_theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("ha_theme", "dark");
  }
}

// Apply saved theme as early as possible on every page
applyStoredTheme();

// ---------- SMALL FORMAT HELPERS ----------

function formatDate(dateStr, timeStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T${timeStr || "00:00:00"}`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
    (timeStr ? " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "");
}

function statusClass(status) {
  if (!status) return "normal";
  const s = status.toLowerCase();
  if (s.includes("normal") || s.includes("keep")) return "normal";
  if (s.includes("high") || s.includes("obese") || s.includes("fever")) return "danger";
  return "warning";
}
