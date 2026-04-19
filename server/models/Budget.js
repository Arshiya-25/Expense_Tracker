const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

BudgetSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true },
);

module.exports = mongoose.model("Budget", BudgetSchema);
