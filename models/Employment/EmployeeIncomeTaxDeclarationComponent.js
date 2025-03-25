const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeIncomeTaxDeclarationComponentSchema = new Schema(
  {
    incomeTaxComponent: {
      type: mongoose.Schema.ObjectId,
      ref: "IncomeTaxComponant",
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    maximumAmount: {
      type: Number,
      required: true,
    },
    appliedAmount: {
      type: Number,
      required: true,
    },
    approvedAmount: {
      type: Number,
      required: true,
    },
    approvalStatus: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
    },
    documentLink: {
      type: String,
    },
    employeeIncomeTaxDeclarationAttachments: {
      type: Array
    },
    employeeIncomeTaxDeclaration: {
      type: mongoose.Schema.ObjectId,
      ref: "EmployeeIncomeTaxDeclaration",
      required: true,
    },
  },
  { collection: "EmployeeIncomeTaxDeclarationComponent" }
);

employeeIncomeTaxDeclarationComponentSchema.pre(/^find/,async function(next) {
  try {
    this.populate({
      path: 'incomeTaxComponent',
      select: 'id componantName section'
    });
  } catch (error) {
    console.error("Error populating fixed deductions:", error);
  }
  next();
});

module.exports = mongoose.model(
  "EmployeeIncomeTaxDeclarationComponent",
  employeeIncomeTaxDeclarationComponentSchema
);
