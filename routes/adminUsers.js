const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ✅ Update user role
router.put("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;