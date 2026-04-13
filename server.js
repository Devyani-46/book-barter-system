const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Book = require("./models/Book");
const Transaction = require("./models/Transaction");
const ChatRequest = require("./models/ChatRequest");
const Message = require("./models/Message");

const adminAuth = require("./routes/adminAuth");

const app = express();

// ✅ IMPORTANT: dynamic port for Render
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*"
}));
app.use(express.json({ limit: "10mb" }));

// ❌ REMOVE this (important)
// app.use(express.static(path.join(__dirname, "../book-barter-frontend")));

/* ================= ROUTES ================= */
app.use("/api/admin", adminAuth);

/* ================= MONGODB ================= */
// ✅ IMPORTANT: use Atlas (NOT localhost)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("✅ Book Barter Backend Running");
});

/* ================= YOUR APIs ================= */
// (Keep ALL your existing APIs SAME below this — no changes needed)

// ... (no change to your routes)

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});