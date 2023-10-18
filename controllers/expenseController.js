
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ExpenseCategory = require('../models/Expense/ExpenseCategory'); // Import ExpenseCategory model
const ExpenseApplicationField = require('../models/Expense/ExpenseApplicationField')
const ExpenseApplicationFieldValue = require('../models/Expense/ExpenseApplicationFieldValue')

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
  if (!expenseCategory) {
    return next(new AppError('Expense category not found', 404));
  }

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

  if (!expenseCategory) {
    return next(new AppError('Expense category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: expenseCategory,
  });
});

exports.deleteExpenseCategory = catchAsync(async (req, res, next) => {
  const expenseCategory = await ExpenseCategory.findByIdAndDelete(req.params.id);
  if (!expenseCategory) {
    return next(new AppError('Expense category not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllExpenseCategories = catchAsync(async (req, res, next) => {
  const expenseCategories = await ExpenseCategory.find();
  res.status(200).json({
    status: 'success',
    data: expenseCategories,
  });
});

exports.addExpenseApplicationField = catchAsync(async (req, res, next) => {
    const { expenseCategory, fieldName, fieldType, isMandatory } = req.body;
    const expenseApplicationField = await ExpenseApplicationField.create({
      expenseCategory,
      fieldName,
      fieldType,
      isMandatory,
    });
  
    res.status(201).json({
      status: 'success',
      data: expenseApplicationField,
    });
});

exports.getExpenseApplicationField = catchAsync(async (req, res, next) => {
    const expenseApplicationField = await ExpenseApplicationField.findById(req.params.id);
    if (!expenseApplicationField) {
      return next(new AppError('Expense application field not found', 404));
    }
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
    const expenseApplicationField = await ExpenseApplicationField.findByIdAndDelete(req.params.id);
  
    if (!expenseApplicationField) {
      return next(new AppError('Expense application field not found', 404));
    }
  
    res.status(204).json({
      status: 'success',
      data: null,
    });
});

exports.getExpenseApplicationFieldsByCategory = catchAsync(async (req, res, next) => {
    console.log("hello");
    const expenseApplicationFields = await ExpenseApplicationField.find({}).where('expenseCategory').equals(req.params.expenseCategoryId);
 
    if (!expenseApplicationFields || expenseApplicationFields.length === 0) {
      return next(new AppError('Expense application fields not found for the given category', 404));
    }
  
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
  if (!expenseApplicationFieldValue) {
    return next(new AppError('ExpenseApplicationFieldValue not found', 404));
  }
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
  if (!expenseApplicationFieldValues || expenseApplicationFieldValues.length === 0) {
    return next(new AppError('ExpenseApplicationFieldValues not found for the specified ExpenseApplicationField', 404));
  }

  res.status(200).json({
    status: 'success',
    data: expenseApplicationFieldValues
  });
});