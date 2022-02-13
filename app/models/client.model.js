const mongoose = require("mongoose");

const Client = mongoose.model(
  "client",
  new mongoose.Schema({
    f_name: {type: String, required: true},
    l_name: {type: String, required: true},
    m_name: {type: String},
    values: {type: Array, ref: 'data'}
  })
);

module.exports = Client;
