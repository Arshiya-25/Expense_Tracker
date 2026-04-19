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
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// MongoDB uses this index instead of scanning every document
TransactionSchema.index({ userId: 1, date: -1 }); // -1 = newest first

module.exports = mongoose.model("Transaction", TransactionSchema);
