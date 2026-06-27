# FinFlow - Expense Tracker

A full-stack personal finance web application built to bring clarity to your spending, budgets, and savings goals — without the clutter.

🔗 **Live Demo:** [expense-tracker-l173.vercel.app](https://expense-tracker-l173.vercel.app)

## Features

- JWT-based user authentication (register & login)
- Add, edit, and delete transactions
- Set monthly budgets per category and track spending in real time
- **Budget Headroom** -
  instead of just showing % used, each budget card calculates how much you can safely spend per day for the
  rest of the month based on what's remaining (e.g. "₹800/day safe to spend · 4 days left")
- Dashboard with income, expenses, net savings, and active goals at a glance
- Spending breakdown by category with a donut chart
- Savings goals with progress tracking and target deadlines
- Upcoming bill and subscription reminders
- Demo mode with pre-seeded realistic data


## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React (Vite), CSS       |
| Backend    | Node.js, Express.js     |
| Database   | MongoDB Atlas           |
| Deployment | Vercel (FE), Render (BE)|



## Project Structure

```
FinFlow/
├── client/       # React frontend
└── server/       # Express backend
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Arshiya-25/Expense_Tracker.git
cd Expense_Tracker
```

### 2. Set Up the Backend

```bash
cd server
npm install
npm run dev
```

### 3. Set Up the Frontend

```bash
cd client
npm install
npm run dev
```

