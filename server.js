const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");
const Book = require("./models/Book");
const Transaction = require("./models/Transaction");
const ChatRequest = require("./models/ChatRequest");
const Message = require("./models/Message");

const adminAuth = require("./routes/adminAuth");

const app = express();              // ✅ app FIRST
const PORT = 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ Serve frontend files (MOVED to correct place)
app.use(express.static(path.join(__dirname, "../book-barter-frontend")));

// ✅ Admin routes
app.use("/api/admin", adminAuth);

/* ================= MONGODB ================= */
mongoose
  .connect("mongodb://127.0.0.1:27017/bookBarterDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("✅ Book Barter Backend Running");
});

/* ================= AUTH ================= */
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.json({ success: false, message: "User exists" });

  const user = await User.create({ name, email, password });
  res.json({ success: true, user });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) return res.json({ success: false });

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/* ================= USER PROFILE ================= */
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({});
    res.json(user);
  } catch {
    res.status(500).json({});
  }
});

app.put("/user/:id", async (req, res) => {
  try {
    const { fullname, bio, avatar } = req.body;
    const updateData = {};

    if (fullname !== undefined) updateData.fullname = fullname;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= BOOKS ================= */
app.post("/add-book", async (req, res) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      condition: req.body.condition,
      description: req.body.description,
      coverImage: req.body.coverImage,
      status: req.body.status || "AVAILABLE",
      userId: req.body.userId
    });

    await book.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/my-books/:userId", async (req, res) => {
  const books = await Book.find({ userId: req.params.userId });
  res.json(books);
});

app.delete("/delete-book/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get("/all-books/:userId", async (req, res) => {
  const books = await Book.find({ userId: { $ne: req.params.userId } });
  res.json(books);
});

/* ================= TRANSACTIONS ================= */
app.get("/transactions/:userId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .populate("bookId", "title coverImage")
      .sort({ date: -1 });

    res.json(transactions);
  } catch {
    res.status(500).json([]);
  }
});

/* ================= RECORDS ================= */
app.get("/records/:userId", async (req, res) => {
  try {
    const books = await Book.find({ userId: req.params.userId });
    res.json(books);
  } catch {
    res.status(500).json({ error: "Failed to load records" });
  }
});

app.get("/book/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.json(book);
});

app.put("/update-book/:id", async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body);
  res.json({ success: true });
});

/* ================= CHAT REQUEST SYSTEM ================= */
app.post("/chat-request", async (req, res) => {
  const { fromUser, toUser, bookId } = req.body;

  const exists = await ChatRequest.findOne({
    fromUser,
    toUser,
    requestedBook: bookId,
    status: "PENDING"
  });

  if (exists) return res.status(400).json({ message: "Request already sent" });

  await ChatRequest.create({
    fromUser,
    toUser,
    requestedBook: bookId
  });

  res.json({ success: true });
});

app.get("/chat-requests/:userId", async (req, res) => {
  const requests = await ChatRequest.find({
    toUser: req.params.userId,
    status: "PENDING"
  })
    .populate("fromUser", "name")
    .populate("requestedBook", "title author");

  res.json(requests);
});

app.post("/accept-request/:id", async (req, res) => {
  try {
    const request = await ChatRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    request.status = "ACCEPTED";
    await request.save();

    res.json({
      success: true
    });

  } catch (err) {
    console.error("Accept request error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.post("/decline-request/:id", async (req, res) => {
  await ChatRequest.findByIdAndUpdate(req.params.id, { status: "REJECTED" });
  res.json({ success: true });
});

/* ================= CHATS ================= */
app.get("/chats/:userId", async (req, res) => {
  const chats = await ChatRequest.find({
    status: "ACCEPTED",
    $or: [{ fromUser: req.params.userId }, { toUser: req.params.userId }]
  }).populate("fromUser toUser", "name");

  res.json(chats);
});

/* ================= MESSAGES ================= */
app.post("/send-message", async (req, res) => {
  const msg = await Message.create(req.body);
  res.json(msg);
});

app.get("/messages/:u1/:u2", async (req, res) => {
  const msgs = await Message.find({
    $or: [
      { sender: req.params.u1, receiver: req.params.u2 },
      { sender: req.params.u2, receiver: req.params.u1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(msgs);
});

app.delete("/delete-chat/:u1/:u2", async (req, res) => {
  try {
    await Message.deleteMany({
      $or: [
        { sender: req.params.u1, receiver: req.params.u2 },
        { sender: req.params.u2, receiver: req.params.u1 }
      ]
    });

    await ChatRequest.deleteMany({
      status: "ACCEPTED",
      $or: [
        { fromUser: req.params.u1, toUser: req.params.u2 },
        { fromUser: req.params.u2, toUser: req.params.u1 }
      ]
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});