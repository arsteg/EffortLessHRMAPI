var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subDepartmentSchema = new Schema({  
  subDepartmentName: {
    type: String,
    required: true
  },
  subDepartmentCode: {
    type: String,
    required: true
  }
}, { collection: 'SubDepartment' });

module.exports = mongoose.model('SubDepartment', subDepartmentSchema);
