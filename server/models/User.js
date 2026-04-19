// Mongoose Schema = a blueprint. Like a class, but for database documents.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // removes accidental spaces
    },
    email: {
      type: String,
      required: true,
      unique: true, // MongoDB creates an index — no two users can share an email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "", // URL to profile picture — empty by default
    },
    currency: {
      type: String,
      default: "INR", // each user picks their currency
    },
    monthlyIncome: {
      type: Number,
      default: 0, // optional extra profile field
    },
    savingsGoal: {
      type: Number,
      default: 0, // optional savings target
    },
    monthlyIncomeGoal: {
      type: Number,
      default: 0,
    },
    goals: {
      type: [
        {
          title: {
            type: String,
            trim: true,
            default: "",
          },
          targetAmount: {
            type: Number,
            default: 0,
          },
          currentAmount: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [], // keeps old users safe
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  },
);

// PRE-SAVE HOOK — runs automatically before every .save()
UserSchema.pre("save", async function (next) {
  // Only re-hash if the password field was actually changed
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// INSTANCE METHOD — a function you can call on any User document
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model — mongoose.model("User", UserSchema) creates:
module.exports = mongoose.model("User", UserSchema);
