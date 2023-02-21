const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');
const Schema = mongoose.Schema;

const productivityModelSchema = new mongoose.Schema({
    icon: {
        required: true,
        type: String
    },
    key:{
        required:true,
        type:String
    },
    name: {
        required: true,
        type: String
    },
    isProductive: {
        type:Boolean
    },
    createdOn: {
        type: Date,
        required: true    
      },
      updatedOn: {
        type: Date,
        required: true    
      },        
      createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'//,
      //  required: [true, 'User must belong to a User']
      },
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'//,
        //required: [true, 'User must belong to a User']
      },
      company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'Company must belong to a Company']
      },
});
module.exports = mongoose.model("Productivity", productivityModelSchema);
