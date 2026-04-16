// routes/transactions.js — ALL TRANSACTION CRUD + ANALYTICS
// Notice how every route uses `protect` middleware and filters by `req.userId`
// This is what makes data per-user — each query is scoped to the logged-in user

const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const protect = require("../middleware/auth");

// All routes here require authentication
router.use(protect);

// GET /api/transactions — get all transactions for current user
// Supports filters: ?type=expense&month=3&year=2026&category=Food
router.get("/", async (req, res) => {
  try {
    const { type, month, year, category } = req.query;

    // Build the filter object dynamically
    const filter = { userId: req.userId };
    if (type) filter.type = type;
    if (category) filter.category = category;

    // Filter by month/year using MongoDB date range
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59); // last day of month
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions — create a new transaction
router.post("/", async (req, res) => {
  try {
    const { type, amount, category, description, date, isRecurring, recurringDay } = req.body;

    const transaction = await Transaction.create({
      userId: req.userId, // always from the token, never from the request body (security!)
      type,
      amount,
      category,
      description,
      date: date || new Date(),
      isRecurring: isRecurring || false,
      recurringDay: recurringDay || null,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    // findOneAndDelete with userId check — user can only delete their own transactions
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/transactions/:id — update a transaction
router.put("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true } // return the UPDATED document, not the old one
    );
    if (!transaction) return res.status(404).json({ message: "Not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/transactions/summary — AGGREGATION (the star feature)
// MongoDB aggregation pipeline = a series of transformation steps on your data
// This returns monthly totals, category breakdown — powers your charts
router.get("/summary", async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const userId = require("mongoose").Types.ObjectId.createFromHexString(req.userId);

    // AGGREGATION PIPELINE — like SQL GROUP BY but more powerful
    const monthlySummary = await Transaction.aggregate([
      {
        // Stage 1: filter only this user's transactions for this year
        $match: {
          userId: userId,
          date: {
            $gte: new Date(targetYear, 0, 1),
            $lte: new Date(targetYear, 11, 31),
          },
        },
      },
      {
        // Stage 2: group by month and type, sum the amounts
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        // Stage 3: sort by month
        $sort: { "_id.month": 1 },
      },
    ]);

    // Category breakdown for current month
    const now = new Date();
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          type: "expense",
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ monthlySummary, categoryBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
