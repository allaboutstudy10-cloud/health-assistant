// config.js
// Simple config file for a university project.
// JWT_SECRET and MONGODB_URI should always come from environment
// variables in any real deployment and never be committed to source
// control. The fallback values here are only for quick local testing.

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "health-assistant-super-secret-key-change-me",
  PORT: process.env.PORT || 5000,
};
