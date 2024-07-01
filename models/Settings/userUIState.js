var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userUIStateSchema = new Schema({       
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true,    
      },
    key: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },       
  },
  {
    toJSON: { virtuals: true }, // Use virtuals when outputing as JSON
    toObject: { virtuals: true } // Use virtuals when outputing as Object
  },
  {collection: 'userUIState' });  
  module.exports = mongoose.model('userUIState', userUIStateSchema);