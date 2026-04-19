require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// express() creates your server app
const app = express();

// MIDDLEWARE — code that runs on EVERY request before it hits your routes
// cors() allows your React app (different port) to talk to this server. Without this, browsers block cross-origin requests (security feature)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// express.json() lets Express read JSON bodies from POST requests
app.use(express.json());

// ROUTES — import your route files and mount them at a URL prefix
app.use("/api/auth", require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/budgets", require("./routes/budgets"));

// Health check — useful for deployment (Render pings this to know you're alive)
app.get("/", (req, res) => res.json({ status: "FinFlow API running" }));

// CONNECT TO MONGODB then start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
