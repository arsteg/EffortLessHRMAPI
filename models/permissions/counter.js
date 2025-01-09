// models/counter.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var counterSchema = new Schema({
  company: { type: mongoose.Schema.ObjectId, ref: 'Company', required: true },
  counter: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);
