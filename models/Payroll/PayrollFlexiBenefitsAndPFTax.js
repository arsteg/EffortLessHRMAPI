var payrollFlexiBenefitsAndPFTaxSchema = new Schema({
    PayrollUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'PayrollUsers',
      required: true
    },
    TotalFlexiBenefitAmount: {
      type: Number,
      required: true
    },
    TotalProfessionalTaxAmount: {
      type: Number,
      required: true
    }
  }, { collection: 'PayrollFlexiBenefitsAndPFTax' });
  