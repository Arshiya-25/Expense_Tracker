// routes/budgets.js — SET AND GET SPENDING LIMITS PER CATEGORY

const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const protect = require("../middleware/auth");

router.use(protect);

// GET /api/budgets?month=3&year=2026 — get budgets with actual spending
router.get("/", async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get all budgets for this user/month/year
    const budgets = await Budget.find({
      userId: req.userId,
      month: month - 1, // stored as 0-indexed
      year,
    });

    // Get actual spending per category for this month
    const userId = require("mongoose").Types.ObjectId.createFromHexString(req.userId);
    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "expense",
          date: {
            $gte: new Date(year, month - 1, 1),
            $lte: new Date(year, month, 0),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    // Merge budgets with actual spending
    const spendingMap = {};
    spending.forEach((s) => (spendingMap[s._id] = s.spent));

    const result = budgets.map((b) => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
      percentage: Math.round(((spendingMap[b.category] || 0) / b.limit) * 100),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/budgets — set a budget (upsert = create if not exists, update if exists)
router.post("/", async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    // findOneAndUpdate with upsert:true = "update or create"
    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, category, month: month - 1, year },
      { limit },
      { upsert: true, new: true }
    );

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Budget removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
