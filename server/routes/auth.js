const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// jwt.sign() takes a payload (what to store) + secret + options
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create user — the pre-save hook in User.js will hash the password
    const user = await User.create({ name, email, password });

    // Send back token + user info (never send password!)
    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
        savingsGoal: user.savingsGoal,
        monthlyIncomeGoal: user.monthlyIncomeGoal,
        goals: user.goals,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the typed password against the stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        avatar: user.avatar,
        monthlyIncome: user.monthlyIncome,
        savingsGoal: user.savingsGoal,
        monthlyIncomeGoal: user.monthlyIncomeGoal,
        goals: user.goals,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me — get current user from token (used on page reload)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// PATCH /api/auth/profile — update user profile
router.patch("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.currency) updates.currency = req.body.currency;
    if (req.body.monthlyIncome !== undefined)
      updates.monthlyIncome = req.body.monthlyIncome;
    if (req.body.savingsGoal !== undefined)
      updates.savingsGoal = req.body.savingsGoal;
    if (req.body.monthlyIncomeGoal !== undefined)
      updates.monthlyIncomeGoal = req.body.monthlyIncomeGoal;
    if (req.body.goals !== undefined) updates.goals = req.body.goals;

    const user = await User.findByIdAndUpdate(decoded.id, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
