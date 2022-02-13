const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.client = require("./client.model");
db.data = require("./data.model");

module.exports = db;