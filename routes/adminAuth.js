const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Book = require("../models/Book");
const Transaction = require("../models/Transaction");

/* ================= ADMIN LOGIN ================= */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

/* ================= DASHBOARD STATS ================= */
router.get("/stats", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const books = await Book.countDocuments();
    res.json({ users, books });
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

/* ================= USERS ================= */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ✅ ADD THIS — DELETE USER (THIS WAS MISSING) */
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admin account
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted successfully" });

  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error while deleting user" });
  }
});

/* ================= BOOKS ================= */
router.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

router.delete("/books/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ================= ADMIN REPORTS ================= */
router.get("/reports", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const recentActivity = await Transaction.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("userId", "name email")
      .populate("bookId", "title author");

    const dateWiseReport = await Transaction.aggregate([
      {
        $project: {
          action: 1,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
        }
      },
      {
        $group: {
          _id: "$date",
          total: { $sum: 1 },
          rented: { $sum: { $cond: [{ $eq: ["$action", "RENTED"] }, 1, 0] } },
          returned: { $sum: { $cond: [{ $eq: ["$action", "RETURNED"] }, 1, 0] } }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({ totalUsers, totalBooks, totalTransactions, recentActivity, dateWiseReport });

  } catch (err) {
    res.status(500).json({ message: "Report failed", error: err.message });
  }
});

module.exports = router;