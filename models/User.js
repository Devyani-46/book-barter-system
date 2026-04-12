const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  fullname: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("User", userSchema);