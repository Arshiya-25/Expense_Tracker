// index.js — THE ENTRY POINT OF YOUR BACKEND
// This is the first file Node runs. Think of it as the "main gate" of your server.

// dotenv loads your .env file so process.env.MONGO_URI works
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// express() creates your server app — like opening a shop
const app = express();

// MIDDLEWARE — code that runs on EVERY request before it hits your routes
// cors() allows your React app (different port) to talk to this server
// Without this, browsers block cross-origin requests (security feature)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// express.json() lets Express read JSON bodies from POST requests
// Without this, req.body would be undefined
app.use(express.json());

// ROUTES — import your route files and mount them at a URL prefix
// Any request to /api/auth goes to server/routes/auth.js
// Any request to /api/transactions goes to server/routes/transactions.js
app.use("/api/auth", require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/budgets", require("./routes/budgets"));

// Health check — useful for deployment (Render pings this to know you're alive)
app.get("/", (req, res) => res.json({ status: "FinFlow API running" }));

// CONNECT TO MONGODB then start the server
// We only start listening AFTER the DB connects — order matters
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
