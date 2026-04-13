const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  coverImage: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["AVAILABLE", "RENTED"],
      // ✅ SAFETY NET
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
