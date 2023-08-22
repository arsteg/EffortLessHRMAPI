var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeAssetsSchema = new Schema({
  Employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  // Assuming the reference is to a User schema
    required: true
  },
  Asset: {
    type: mongoose.Schema.ObjectId,
    ref: 'Asset',  // Assuming the reference is to an Asset schema
    required: true
  }
}, { collection: 'EmployeeAssets' });

module.exports = mongoose.model('EmployeeAssets', employeeAssetsSchema);
