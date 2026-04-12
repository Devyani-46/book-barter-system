const mongoose = require("mongoose");

const chatRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    requestedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book"
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRequest", chatRequestSchema);
