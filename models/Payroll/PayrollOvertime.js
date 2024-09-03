var payrollOvertimeSchema = new Schema({
    PayrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    OverTime: {
      type: String,
      required: true
    },
    LateComing: {
      type: String,
      required: true
    },
    EarlyGoing: {
      type: String,
      required: true
    },
    FinalOvertime: {
      type: String,
      required: true
    },
    Overtime: {
      type: mongoose.Schema.ObjectId,
      ref: 'Overtime',
      required: true
    }
  }, { collection: 'PayrollOvertime' });
  