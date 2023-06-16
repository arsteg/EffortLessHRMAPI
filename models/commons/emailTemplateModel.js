const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const emailTemplateSchema = new mongoose.Schema({    
    Name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    templateType: {
        type: Number,
        required: true
    },
    contentData: {
        type: String,
        required: true
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
      },
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'//,        
      },
      company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: [true, 'User must belong to a Company']
      },    
},{ collection: 'emailTemplate' })
module.exports = mongoose.model("emailTemplate", emailTemplateSchema);
