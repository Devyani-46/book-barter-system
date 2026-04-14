const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

// Test route
app.get("/", (req, res) => {
  res.send("✅ Book Barter Backend Running");
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});