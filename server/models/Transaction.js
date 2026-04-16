// models/Transaction.js — DEFINES WHAT A TRANSACTION LOOKS LIKE
// Notice the `userId` field — this is how each transaction is "owned" by a user
// Every query filters by userId so users only see their own data

const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // References a User document
      ref: "User", // tells Mongoose which model to reference
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"], // only these two values allowed
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      // categories for expense
      // "Food", "Transport", "Shopping", "Entertainment", "Utilities", "Health", "Other"
      // categories for income
      // "Salary", "Freelance", "Business", "Investment", "Other"
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now, // defaults to today if not provided
    },
    isRecurring: {
      type: Boolean,
      default: false, // monthly recurring transactions
    },
    recurringDay: {
      type: Number, // day of month (1-31) if recurring
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries — when React asks "get all transactions for userId X",
// MongoDB uses this index instead of scanning every document
TransactionSchema.index({ userId: 1, date: -1 }); // -1 = newest first

module.exports = mongoose.model("Transaction", TransactionSchema);
