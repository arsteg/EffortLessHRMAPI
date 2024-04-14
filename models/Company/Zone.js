var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var zoneSchema = new Schema({  
  startDate: {
    type: Date,
    required: true
  },
  zoneCode: {
    type: String,
    required: true
  },
  zoneName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company', // Assuming the reference is to a Company schema
    required: true
  }
}, { collection: 'Zone' });

module.exports = mongoose.model('Zone', zoneSchema);
