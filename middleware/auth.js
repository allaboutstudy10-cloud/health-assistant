// middleware/auth.js
// Protects routes by checking for a valid JWT token in the
// "Authorization: Bearer <token>" header. If valid, it attaches
// the logged-in user's id to req.userId so the route handlers
// know which user is making the request.

const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config").JWT_SECRET;

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

module.exports = requireAuth;
