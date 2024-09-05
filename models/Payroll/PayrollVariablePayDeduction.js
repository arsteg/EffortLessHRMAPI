var payrollVariablePayDeductionSchema = new Schema({
    payrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    variableDeduction: {
      type: mongoose.Schema.ObjectId,
      ref: 'VariableDeduction',
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }, { collection: 'PayrollVariablePayDeduction' });
  