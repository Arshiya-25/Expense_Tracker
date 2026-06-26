const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// Seed/Reset function for the demo account
async function resetDemoUser() {
  try {
    const email = "demo@finflow.com";
    console.log("Resetting/Seeding demo user...");

    // 1. Find and delete existing demo user, budgets, and transactions
    let demoUser = await User.findOne({ email });
    if (demoUser) {
      await Transaction.deleteMany({ userId: demoUser._id });
      await Budget.deleteMany({ userId: demoUser._id });
      await User.deleteOne({ _id: demoUser._id });
      console.log("Previous demo user and associated data cleared.");
    }

    // 2. Create the Demo User document
    // The pre-save hook in User.js automatically hashes the password
    demoUser = new User({
      name: "Demo User",
      email: email,
      password: "demouser123",
      currency: "INR",
      monthlyIncome: 100000,
      savingsGoal: 20000,
      isDemo: true,
      goals: [
        {
          title: "Trip to Goa",
          targetAmount: 80000,
          currentAmount: 35000,
          deadline: new Date("2026-09-15"),
        },
        {
          title: "New Laptop",
          targetAmount: 75000,
          currentAmount: 22000,
          deadline: new Date("2026-12-15"),
        },
      ],
      reminders: [
        {
          title: "Amazon Prime",
          amount: 299,
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
          type: "subscription",
        },
      ],
    });
    await demoUser.save();
    console.log("Demo user document created.");

    // 3. realistic financial transactions in the current month/year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    await Transaction.create([
      {
        userId: demoUser._id,
        type: "income",
        amount: 100000,
        category: "Salary",
        description: "Monthly Salary",
        date: new Date(currentYear, currentMonth, 1),
        isRecurring: true,
        recurringDay: 1,
      },
      {
        userId: demoUser._id,
        type: "expense",
        amount: 4200,
        category: "Food",
        description: "Grocery run",
        date: new Date(
          currentYear,
          currentMonth,
          Math.max(1, now.getDate() - 5),
        ),
      },
      {
        userId: demoUser._id,
        type: "expense",
        amount: 1800,
        category: "Entertainment",
        description: "Netflix",
        date: new Date(
          currentYear,
          currentMonth,
          Math.max(1, now.getDate() - 3),
        ),
      },
      {
        userId: demoUser._id,
        type: "expense",
        amount: 6500,
        category: "Shopping",
        description: "Myntra order",
        date: new Date(
          currentYear,
          currentMonth,
          Math.max(1, now.getDate() - 1),
        ),
      },
    ]);
    console.log("Demo transactions created.");

    // 4. category budgets for the current month and year
    // Stored as 0-indexed month on the backend (e.g. currentMonth)
    await Budget.create([
      {
        userId: demoUser._id,
        category: "Food",
        limit: 15000,
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: "Entertainment",
        limit: 5000,
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: "Shopping",
        limit: 10000,
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: "Health",
        limit: 3000,
        month: currentMonth,
        year: currentYear,
      },
    ]);
    console.log("Demo budgets created and linked.");
  } catch (err) {
    console.error("Error resetting/seeding demo user:", err);
  }
}

module.exports = { resetDemoUser };
