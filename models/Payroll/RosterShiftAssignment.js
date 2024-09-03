var rosterShiftAssignmentSchema = new Schema({
    shift: {
      type: mongoose.Schema.ObjectId,
      ref: 'Shift',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    repeat: {
      type: Boolean,
      required: true
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],  // Example enum values, replace with actual values
    },
    endsOn: {
      type: String
    },
    endDate: {
      type: Date
    },
    company: {
      type: mongoose.Schema.ObjectId,
      ref: 'Company',
      required: true
    }
  }, { collection: 'RosterShiftAssignment' });
  