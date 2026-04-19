const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify throws an error if the token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Now every route handler can access req.userId
    req.userId = decoded.id;

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = protect;
