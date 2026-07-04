// server.js
// Entry point of the Health Assistant backend.
// Run with: npm install  then  npm start
// Server runs on http://localhost:5000 by default.

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { PORT } = require("./config");
const connectDB = require("./db");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const healthRoutes = require("./routes/health");
const historyRoutes = require("./routes/history");
const dashboardRoutes = require("./routes/dashboard");
const symptomsRoutes = require("./routes/symptoms");

const app = express();
app.use(express.static('frontend'));//this line can be deleted

app.use(cors());
app.use(express.json());

// ---------- API ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/symptoms", symptomsRoutes);
// ---------- SERVE THE FRONTEND ----------
// Fixed path: Looks directly inside the root workspace folder where frontend lives
const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start the server immediately so StackBlitz stays alive
app.listen(PORT, () => {
  console.log(`Health Assistant server running at http://localhost:${PORT}`);
});

// Run the database connection in the background
connectDB();