
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ExpenseCategory = require('../models/Expense/ExpenseCategory'); // Import ExpenseCategory model
const ExpenseApplicationField = require('../models/Expense/ExpenseApplicationField');
const ExpenseApplicationFieldValue = require('../models/Expense/ExpenseApplicationFieldValue');
const ExpenseTemplate = require('../models/Expense/ExpenseTemplate');
const ExpenseTemplateApplicableCategories = require('../models/Expense/ExpenseTemplateApplicableCategories');
const EmployeeExpenseAssignment = require('../models/Expense/EmployeeExpenseAssignment');
const ExpenseReport = require('../models/Expense/ExpenseReport');
const ExpenseReportExpense = require('../models/Expense/ExpenseReportExpense');
const ExpenseAdvance = require('../models/Expense/ExpenseAdvance');
const AppError = require('../utils/appError');

exports.createExpenseCategory = catchAsync(async (req, res, next) => {
    const { type, label } = req.body;
    const company = req.cookies.companyId;
  
    // Validate if company value exists in cookies
    if (!company) {
      return res.status(400).json({
        status: 'failure',
        message: 'Company information missing in cookies',
      });
    }
  
    const expenseCategory = await ExpenseCategory.create({ type, label, company });
  
    res.status(201).json({
      status: 'success',
      data: expenseCategory,
    });
 });  

exports.getExpenseCategory = catchAsync(async (req, res, next) => {
  const expenseCategory = await ExpenseCategory.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: expenseCategory,
  });
});

exports.updateExpenseCategory = catchAsync(async (req, res, next) => {

  const expenseCategory = await ExpenseCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
 });

  res.status(200).json({
    status: 'success',
    data: expenseCategory,
  });
});

exports.deleteExpenseCategory = catchAsync(async (req, res, next) => {
  const applicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseCategory').equals(req.params.id);
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseCategory').equals(req.params.id);  
  const expenseAdvance = await ExpenseAdvance.find({}).where('category').equals(req.params.id);  
  if (applicableCategories.length > 0 || expenseReportExpenses.length > 0 || expenseAdvance.length > 0) {
    return res.status(400).json({
      status: 'failed',
      data: null,
      message: 'Expense Category is already in use. Please delete related records before deleting the Expense Category.',
    });
  }
const expenseCategoryInstance = await ExpenseCategory.findById(req.params.id);
await expenseCategoryInstance.remove();
  if (!expenseCategoryInstance) {
    return next(new AppError('Expense category not found', 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllExpenseCategories = catchAsync(async (req, res, next) => {
  const expenseCategories = await ExpenseCategory.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: expenseCategories,
  });
});


exports.addExpenseApplicationField = catchAsync(async (req, res, next) => {
    const { expenseCategory, fields } = req.body;

    // Validate the incoming data
    if (!expenseCategory || !Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({
            status: 'failure',
            error: 'Invalid request data',
        });
    }

    // Prepare an array to store the created fields
    const createdFields = [];

    // Iterate through the fields array and create ExpenseApplicationField records
    for (const field of fields) {
        const { fieldName, fieldType, isMandatory } = field;
        const expenseApplicationField = await ExpenseApplicationField.create({
            expenseCategory,
            fieldName,
            fieldType,
            isMandatory,
        });
        createdFields.push(expenseApplicationField);
    }

    res.status(201).json({
        status: 'success',
        data: createdFields,
    });
});


exports.getExpenseApplicationField = catchAsync(async (req, res, next) => {
    const expenseApplicationField = await ExpenseApplicationField.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: expenseApplicationField,
    });
});

exports.updateExpenseApplicationField = catchAsync(async (req, res, next) => {
    const expenseApplicationField = await ExpenseApplicationField.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
  
    if (!expenseApplicationField) {
      return next(new AppError('Expense application field not found', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: expenseApplicationField,
    });
});

exports.deleteExpenseApplicationField = catchAsync(async (req, res, next) => {
    const expenseApplicationField = await ExpenseApplicationField.findById(req.params.id);
    await expenseApplicationField.remove();
    if (!expenseApplicationField) {
      return next(new AppError('Expense application field not found', 404));
    }  
    res.status(204).json({
      status: 'success',
      data: null,
    });
});

exports.getExpenseApplicationFieldsByCategory = catchAsync(async (req, res, next) => {
    const expenseApplicationFields = await ExpenseApplicationField.find({}).where('expenseCategory').equals(req.params.expenseCategoryId);
    res.status(200).json({
      status: 'success',
      data: expenseApplicationFields,
    });
});

exports.createExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.create(req.body);
  res.status(201).json({
    status: 'success',
    data: expenseApplicationFieldValue
  });
});

exports.getExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: expenseApplicationFieldValue
  });
});

exports.updateExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!expenseApplicationFieldValue) {
    return next(new AppError('ExpenseApplicationFieldValue not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: expenseApplicationFieldValue
  });
});

exports.deleteExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.findByIdAndDelete(req.params.id);
  if (!expenseApplicationFieldValue) {
    return next(new AppError('ExpenseApplicationFieldValue not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getExpenseApplicationFieldValuesByFieldId = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldId = req.params.expenseApplicationFieldId;
  const expenseApplicationFieldValues = await ExpenseApplicationFieldValue.find({ expenseApplicationField: expenseApplicationFieldId });
  
  res.status(200).json({
    status: 'success',
    data: expenseApplicationFieldValues
  });
});

exports.createExpenseTemplate = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const expenseTemplate = await ExpenseTemplate.create(req.body);
  res.status(201).json({
    status: 'success',
    data: expenseTemplate
  });
});

exports.getExpenseTemplate = catchAsync(async (req, res, next) => {
  const expenseTemplate = await ExpenseTemplate.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: expenseTemplate
  });
});

exports.updateExpenseTemplate = catchAsync(async (req, res, next) => {
  const expenseTemplate = await ExpenseTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!expenseTemplate) {
    return next(new AppError('Expense Template not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: expenseTemplate
  });
});

exports.deleteExpenseTemplate = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.find({}).where('expenseTemplate').equals(req.params.id);
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseTemplate').equals(req.params.id);  
  if (employeeExpenseAssignment.length > 0 || expenseReportExpenses.length > 0) {
    return res.status(400).json({
      status: 'failed',
      data: null,
      message: 'Expense Template is already in use. Please delete related records before deleting the Expense Template.',
    });
  }
  
  const expenseTemplate = await ExpenseTemplate.findByIdAndDelete(req.params.id);
  
  if (!expenseTemplate) {
    return next(new AppError('Expense Template not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllExpenseTemplates = catchAsync(async (req, res, next) => {
  const expenseTemplates = await ExpenseTemplate.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: expenseTemplates
  });
});

exports.createExpenseTemplateApplicableCategories = catchAsync(async (req, res, next) => {
  const { expenseTemplate, expenseCategory } = req.body;
  const isExistsApplicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseCategory').equals(expenseCategory).where('expenseTemplate').equals(expenseTemplate);
  if (isExistsApplicableCategories.length > 0) {
    return res.status(400).json({
      status: 'failed',
      data: null,
      message: 'Expense Category is already Applicable to Expense Template.',
    });
  }  
  const applicableCategories = await ExpenseTemplateApplicableCategories.create({ expenseTemplate, expenseCategory });
  res.status(201).json({
    status: 'success',
    data: applicableCategories
  });
});

exports.getExpenseTemplateApplicableCategoriesById = catchAsync(async (req, res, next) => {
  const applicableCategories = await ExpenseTemplateApplicableCategories.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: applicableCategories
  });
});

exports.updateExpenseTemplateApplicableCategories = catchAsync(async (req, res, next) => {
  const { expenseTemplate, expenseCategory } = req.body;
  const applicableCategories = await ExpenseTemplateApplicableCategories.findByIdAndUpdate(
    req.params.id,
    { expenseTemplate, expenseCategory },
    { new: true, runValidators: true }
  );

  if (!applicableCategories) {
    return next(new AppError('ExpenseTemplateApplicableCategories not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: applicableCategories
  });
});

exports.deleteExpenseTemplateApplicableCategories = catchAsync(async (req, res, next) => {
  const applicableCategories = await ExpenseTemplateApplicableCategories.findByIdAndDelete(req.params.id);
  if (!applicableCategories) {
    return next(new AppError('ExpenseTemplateApplicableCategories not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllExpenseTemplateApplicableCategories = catchAsync(async (req, res, next) => {
  const applicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: applicableCategories
  });
});

exports.createEmployeeExpenseAssignment = catchAsync(async (req, res, next) => {
   // Extract companyId from req.cookies
   const companyId = req.cookies.companyId;
   // Check if companyId exists in cookies
   if (!companyId) {
     return next(new AppError('Company ID not found in cookies', 400));
   }
 
   // Add companyId to the request body
   req.body.company = companyId;
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.create(req.body);
  res.status(201).json({
    status: 'success',
    data: employeeExpenseAssignment,
  });
});

exports.getEmployeeExpenseAssignment = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.findById(req.params.id);
  if (!employeeExpenseAssignment) {
    return next(new AppError('EmployeeExpenseAssignment not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: employeeExpenseAssignment,
  });
});

exports.updateEmployeeExpenseAssignment = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!employeeExpenseAssignment) {
    return next(new AppError('EmployeeExpenseAssignment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: employeeExpenseAssignment,
  });
});

exports.deleteEmployeeExpenseAssignment = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.findByIdAndDelete(req.params.id);

  if (!employeeExpenseAssignment) {
    return next(new AppError('EmployeeExpenseAssignment not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllEmployeeExpenseAssignments = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignments = await EmployeeExpenseAssignment.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: employeeExpenseAssignments,
  });
});

exports.createExpenseReport = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }

  // Add companyId to the request body
  req.body.company = companyId;
  const expenseReport = await ExpenseReport.create(req.body);
  res.status(201).json({
    status: 'success',
    data: expenseReport
  });
});

exports.getExpenseReport = catchAsync(async (req, res, next) => {
  const expenseReport = await ExpenseReport.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: expenseReport
  });
});

exports.updateExpenseReport = catchAsync(async (req, res, next) => {
  const expenseReport = await ExpenseReport.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!expenseReport) {
    return next(new AppError('ExpenseReport not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: expenseReport
  });
});

exports.deleteExpenseReport = catchAsync(async (req, res, next) => {
   const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.id);  
  if (expenseReportExpenses.length > 0) {
    return res.status(400).json({
      status: 'failed',
      data: null,
      message: 'Expense Report is already in use. Please delete related records before deleting the Expense Report.',
    });
  }
  const expenseReport = await ExpenseReport.findByIdAndDelete(req.params.id);

  if (!expenseReport) {
    return next(new AppError('ExpenseReport not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllExpenseReports = catchAsync(async (req, res, next) => {
  const expenseReports = await ExpenseReport.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: expenseReports
  });
});

exports.createExpenseReportExpense = catchAsync(async (req, res, next) => {
  const expenseReportExpense = await ExpenseReportExpense.create(req.body);
  res.status(201).json({
    status: 'success',
    data: expenseReportExpense
  });
});

exports.getExpenseReportExpense = catchAsync(async (req, res, next) => {
  const expenseReportExpense = await ExpenseReportExpense.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: expenseReportExpense
  });
});

exports.updateExpenseReportExpense = catchAsync(async (req, res, next) => {
  const expenseReportExpense = await ExpenseReportExpense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!expenseReportExpense) {
    return next(new AppError('Expense Report Expense not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: expenseReportExpense
  });
});

exports.deleteExpenseReportExpense = catchAsync(async (req, res, next) => {
  const expenseReportExpense = await ExpenseReportExpense.findByIdAndDelete(req.params.id);
  if (!expenseReportExpense) {
    return next(new AppError('Expense Report Expense not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllExpenseReportExpenses = catchAsync(async (req, res, next) => {
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: expenseReportExpenses
  });
});

exports.createExpenseAdvance = catchAsync(async (req, res, next) => {
    // Extract companyId from req.cookies
    const companyId = req.cookies.companyId;
    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
    // Add companyId to the request body
    req.body.company = companyId;
    const expenseAdvance = await ExpenseAdvance.create(req.body);
    res.status(201).json({
        status: 'success',
        data: expenseAdvance
    });
});

exports.getExpenseAdvance = catchAsync(async (req, res, next) => {
    const expenseAdvance = await ExpenseAdvance.findById(req.params.id);   
    res.status(200).json({
        status: 'success',
        data: expenseAdvance
    });
});

exports.updateExpenseAdvance = catchAsync(async (req, res, next) => {
    const expenseAdvance = await ExpenseAdvance.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });  
    res.status(200).json({
        status: 'success',
        data: expenseAdvance
    });
});

exports.deleteExpenseAdvance = catchAsync(async (req, res, next) => {
    const expenseAdvance = await ExpenseAdvance.findByIdAndDelete(req.params.id);   
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllExpenseAdvances = catchAsync(async (req, res, next) => {
    const expenseAdvances = await ExpenseAdvance.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
        status: 'success',
        data: expenseAdvances
    });
});
