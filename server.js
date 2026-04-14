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

/* ================= PORT ================= */
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

/* ================= ROUTES ================= */
app.use("/api/admin", adminAuth);

/* ================= MONGODB ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ Mongo Error:", err);
    process.exit(1);
  });

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("✅ Book Barter Backend Running");
});

/* ================= AUTH ================= */

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= USER ================= */

// GET USER
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user || {});
  } catch (err) {
    res.status(500).json({});
  }
});

// UPDATE USER
app.put("/user/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ================= BOOKS ================= */

// ADD BOOK
app.post("/add-book", async (req, res) => {
  try {
    await Book.create(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// MY BOOKS
app.get("/my-books/:userId", async (req, res) => {
  try {
    const books = await Book.find({ userId: req.params.userId });
    res.json(books);
  } catch {
    res.status(500).json([]);
  }
});

// ALL BOOKS
app.get("/all-books/:userId", async (req, res) => {
  try {
    const books = await Book.find({
      userId: { $ne: req.params.userId }
    });
    res.json(books);
  } catch {
    res.status(500).json([]);
  }
});

// DELETE BOOK
app.delete("/delete-book/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= TRANSACTIONS ================= */

app.get("/transactions/:userId", async (req, res) => {
  try {
    const data = await Transaction.find({ userId: req.params.userId });
    res.json(data);
  } catch {
    res.status(500).json([]);
  }
});

/* ================= CHAT ================= */

// SEND REQUEST
app.post("/chat-request", async (req, res) => {
  try {
    await ChatRequest.create(req.body);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// GET REQUESTS
app.get("/chat-requests/:userId", async (req, res) => {
  try {
    const data = await ChatRequest.find({ toUser: req.params.userId });
    res.json(data);
  } catch {
    res.status(500).json([]);
  }
});

// ACCEPT
app.post("/accept-request/:id", async (req, res) => {
  try {
    await ChatRequest.findByIdAndUpdate(req.params.id, {
      status: "ACCEPTED"
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// DECLINE
app.post("/decline-request/:id", async (req, res) => {
  try {
    await ChatRequest.findByIdAndUpdate(req.params.id, {
      status: "REJECTED"
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= MESSAGES ================= */

// SEND MESSAGE
app.post("/send-message", async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.json(msg);
  } catch {
    res.status(500).json({});
  }
});

// GET MESSAGES
app.get("/messages/:u1/:u2", async (req, res) => {
  try {
    const msgs = await Message.find({
      $or: [
        { sender: req.params.u1, receiver: req.params.u2 },
        { sender: req.params.u2, receiver: req.params.u1 }
      ]
    });
    res.json(msgs);
  } catch {
    res.status(500).json([]);
  }
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});