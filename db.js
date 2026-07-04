// db.js
// Connects to MongoDB (Atlas or local) using Mongoose.
// The connection string comes from the MONGODB_URI environment variable —
// never hard-code your real connection string in this file, since it
// contains your database username/password.

const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/health_assistant';

async function connectDB() {
  try {
    // Paste the console.log line right here:
    console.log('Connecting to:', process.env.MONGODB_URI);

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
