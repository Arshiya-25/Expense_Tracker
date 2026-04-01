// middleware/auth.js — THE JWT GUARD
// This is MIDDLEWARE — a function that runs BETWEEN the request and the route handler
// Think of it as a security guard: if you don't have a valid badge (token), you don't get in

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  // Check Authorization header: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify throws an error if the token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user's ID to the request object
    // Now every route handler can access req.userId
    req.userId = decoded.id;

    next(); // "next" = proceed to the actual route handler
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = protect;
