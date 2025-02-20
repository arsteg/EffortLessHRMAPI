// models/appointments/appointmentModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Counter = require('./counter');  // Import the Counter model

var appointmentModelSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  empCode: {
    type: Number
  },
  salaryTypePaid: {
    type: String
  },
  joiningDate: {
    type: Date
  },
  confirmationDate: {
    type: Date
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: [true, 'Company must belong to a Company']
  },
}, {
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
}, { collection: 'Appointment' });

appointmentModelSchema.pre('save', async function(next) {
  let counter;
  if (this.isNew) {
    try {
      // Use upsert: true to either update the existing counter or insert a new one
      counter = await Counter.findOneAndUpdate(
        { company: this.company },
        { $inc: { counter: 1 } },
        { new: true, upsert: true } // upsert will create a new document if none is found
      );

      this.empCode = counter?.counter; // Set empCode to the counter value
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

appointmentModelSchema.index({ user: 1, company: 1 }, { unique: true });
module.exports = mongoose.model('Appointment', appointmentModelSchema);
