var payrollVariablePayAllowanceSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    variableAllowance: {
      type: mongoose.Schema.ObjectId,
      ref: 'VariableAllowance',
      required: true
    },
    amount: {
      type: Number
    }
  }, { collection: 'PayrollVariablePayAllowance' });
  