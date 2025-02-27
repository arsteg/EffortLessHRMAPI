// models/counter.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const counterSchema = new mongoose.Schema({
  company: { type: String, unique: true, required: true },
  counter: { type: Number, default: 1 }
});


module.exports = mongoose.model('Counter', counterSchema);
