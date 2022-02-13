const mongoose = require("mongoose");

const User = mongoose.model(
  "user",
  new mongoose.Schema({
    username: String,
    password: String,
    data: {type: Array, ref: 'client'}
  })
);

module.exports = User;
