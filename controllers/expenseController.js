
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const ExpenseCategory = require('../models/Expense/ExpenseCategory'); // Import ExpenseCategory model
const ExpenseApplicationField = require('../models/Expense/ExpenseApplicationField');
const ExpenseApplicationFieldValue = require('../models/Expense/ExpenseApplicationFieldValue');
const ExpenseTemplate = require('../models/Expense/ExpenseTemplate');
const ExpenseTemplateApplicableCategories = require('../models/Expense/ExpenseTemplateCategory');
const EmployeeExpenseAssignment = require('../models/Expense/EmployeeExpenseAssignment');
const ExpenseReport = require('../models/Expense/ExpenseReport');
const ExpenseReportExpense = require('../models/Expense/ExpenseReportExpense');
const ExpenseAdvance = require('../models/Expense/ExpenseAdvance');
const AppError = require('../utils/appError');
const mongoose = require("mongoose");

exports.createExpenseCategory = catchAsync(async (req, res, next) => {
    const { type, label , isMandatory} = req.body;
    const company = req.cookies.companyId;
  
    // Validate if company value exists in cookies
    if (!company) {
      return res.status(500).json({
        status: 'failure',
        message: 'Company information missing in cookies',
      });
    }
    else
    {
      const expenseCategoryExists = await ExpenseCategory.findOne({ label: label });
      if(expenseCategoryExists)
      {
        res.status(500).json({
          status: 'failure',
          message: 'Label already in use for another category',
        });
      }
      else{
      const expenseCategory = await ExpenseCategory.create({ type, label,isMandatory,company });
    
        res.status(201).json({
          status: 'success',
          data: expenseCategory,
        });
      }
  }
 });  

exports.getExpenseCategory = catchAsync(async (req, res, next) => {
  const expenseCategory = await ExpenseCategory.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: expenseCategory,
  });
});
exports.getExpenseCategoryByEmployee = catchAsync(async (req, res, next) => {
  try {
    const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({
      user: req.params.userId
    }).populate({
      path: 'expenseTemplate',
      populate: {
        path: 'company',
        model: 'Company'
      }
    });
    if (userExpenseAssignment.length===0) {
      return res.status(404).json({
        status: 'failure',
        message: 'Expense assignment not found for the given user.'
      });
    }

   // Retrieve applicable categories for the expense template
    const templateCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(userExpenseAssignment.expenseTemplate._id.toString());
 
    // Extract category IDs from the applicable categories
    const categoryIds = templateCategories.map(tc => tc.expenseCategory);
    
    // Retrieve expense categories based on company and applicable category IDs
    const expenseCategories = await ExpenseCategory.find({
      company: req.cookies.companyId,
      _id: { $in: categoryIds }
    });

    res.status(200).json({
      status: 'success',
      data: expenseCategories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

exports.updateExpenseCategory = catchAsync(async (req, res, next) => {
  const expenseCategoryExists = await ExpenseCategory.findOne({ label: req.body.label, _id: req.params.id });
  if(expenseCategoryExists)
  {
      res.status(500).json({
      status: 'failure',
      message: 'Label already in use for another category',
    });
  }
  else
  {
      const expenseCategory = await ExpenseCategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
     });

      res.status(200).json({
        status: 'success',
        data: expenseCategory,
      });
  }
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
        const { fieldName, fieldType,expenseApplicationFieldValues } = field;
        const expenseApplicationField = await ExpenseApplicationField.create({
            expenseCategory,
            fieldName,
            fieldType,            
        });
        const createdFieldValues = [];
        if (expenseApplicationFieldValues && Array.isArray(expenseApplicationFieldValues) && expenseApplicationFieldValues.length > 0) {
          
          for (const valueItem of expenseApplicationFieldValues) {
              const { value } = valueItem;
              const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.create({
                  expenseApplicationField: expenseApplicationField._id, // Assuming _id is the ID of the newly created field
                  value: value
              });
              createdFieldValues.push(expenseApplicationFieldValue);
          }
          expenseApplicationField.values = createdFieldValues;
      }
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


// Method to update or create ExpenseApplicationField
exports.updateExpenseApplicationField = catchAsync(async (req, res, next) => {
  const { fields } = req.body;

  // Validate incoming data
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    return next(new AppError('Invalid request data', 400));
  }

  try {
    // Iterate through fields to update or create records
    const updatedFields = await Promise.all(
      fields.map(async (field) => {
        const { id, expenseCategory, fieldName, fieldType, expenseApplicationFieldValues } = field;

        if (id) {
          // If id exists, update the existing record
          const updatedField = await ExpenseApplicationField.findByIdAndUpdate(
            id,
            { $set: { expenseCategory, fieldName, fieldType, expenseApplicationFieldValues } },
            { new: true }
          );

          if (!updatedField) {
            throw new AppError(`Expense application field with ID ${id} not found`, 404);
          }

          // Update or create ExpenseApplicationFieldValue records
          await updateOrCreateFieldValues(id, expenseApplicationFieldValues);

          return updatedField;
        } else {
          // If id doesn't exist, create a new record
          const newField = new ExpenseApplicationField({
            expenseCategory,
            fieldName,
            fieldType,
            expenseApplicationFieldValues,
          });

          const createdField = await newField.save();

          // Update or create ExpenseApplicationFieldValue records
          await updateOrCreateFieldValues(createdField._id, expenseApplicationFieldValues);

          return createdField;
        }
      })
    );

    res.status(200).json({
      status: 'success',
      data: updatedFields,
      message: 'Expense application field(s) successfully updated or created',
    });
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    } else {
      return next(new AppError('Internal server error', 500));
    }
  }
});

// Helper function to update or create ExpenseApplicationFieldValue records
async function updateOrCreateFieldValues(fieldId, fieldValues) {
  if (!fieldValues || fieldValues.length === 0) {
    // If no values passed, delete all existing values for the field
    await ExpenseApplicationFieldValue.deleteMany({ expenseApplicationField: fieldId });
    return;
  }
  // Get existing field values for the field
  const existingFieldValues = await ExpenseApplicationFieldValue.find({ expenseApplicationField: fieldId });

  // Extract IDs of existing field values
  const existingValueIds = existingFieldValues.map((value) => value._id.toString());

  // Extract IDs of new field values
  const newValueIds = fieldValues.map((value) => value.id).filter(Boolean);

  // Identify IDs to be deleted (old values not present in the request)
  const valuesToDelete = existingValueIds.filter((valueId) => !newValueIds.includes(valueId));

  // Delete old values
  await ExpenseApplicationFieldValue.deleteMany({ _id: { $in: valuesToDelete } });

  // Update or create new values
  await Promise.all(
    fieldValues.map(async (valueObj) => {
      const { id, value } = valueObj;

      if (id) {
        // If id exists, update the existing record
        await ExpenseApplicationFieldValue.findByIdAndUpdate(
          id,
          { $set: { value } },
          { new: true }
        );
      } else {
        // If id doesn't exist, create a new record
        const newFieldValue = new ExpenseApplicationFieldValue({
          expenseApplicationField: fieldId,
          value,
        });

        await newFieldValue.save();
      }
    })
  );
}



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
  const expenseApplicationFields = await ExpenseApplicationField.find({})
  .where('expenseCategory').equals(req.params.expenseCategoryId);

  if(expenseApplicationFields) {
    for(var i = 0; i < expenseApplicationFields.length; i++) {
      const expenseApplicationFieldValues = await ExpenseApplicationFieldValue.find({})
        .where('expenseApplicationField').equals(expenseApplicationFields[i]._id);

      if(expenseApplicationFieldValues && expenseApplicationFieldValues.length) {
        expenseApplicationFields[i].expenseApplicationFieldValues = expenseApplicationFieldValues;
      } else {
        expenseApplicationFields[i].expenseApplicationFieldValues = null;
      }
    }
  }
res.status(200).json({
  status: 'success',
  data: expenseApplicationFields,
});
});

exports.createExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const { expenseApplicationField , expenseApplicationFieldValues } = req.body;
  // Validate the incoming data
  if (!expenseApplicationField || !Array.isArray(expenseApplicationFieldValues) || expenseApplicationFieldValues.length === 0) {
      return res.status(400).json({
          status: 'failure',
          error: 'Invalid request data',
      });
  }
  // Prepare an array to store the created fields
  const createdFields = [];
  // Iterate through the fields array and create ExpenseApplicationField records
  for (const field of expenseApplicationFieldValues) {
      const {value } = field;
      const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.create({
          expenseApplicationField,
          value,
      });
      createdFields.push(expenseApplicationFieldValue);
  }
  res.status(201).json({
      status: 'success',
      data: createdFields,
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
  const fieldsToUpdate = req.body.fields; // Assuming the array of fields is in the 'fields' property of the request body
  const updatedFields = [];

  for (const field of fieldsToUpdate) {
    const { id, expenseApplicationField, value } = field;

    const updatedField = await ExpenseApplicationFieldValue.findByIdAndUpdate(
      id, // Assuming 'id' is the identifier for the field
      { expenseApplicationField, value },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedField) {
      // Handle the case where the ExpenseApplicationFieldValue with a specific ID is not found
      return next(new AppError(`ExpenseApplicationFieldValue with ID ${id} not found`, 404));
    }

    updatedFields.push(updatedField);
  }

  res.status(200).json({
    status: 'success',
    data: updatedFields,
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

exports.createExpenseTemplateCategories = catchAsync(async (req, res, next) => {
   const { expenseTemplate, expenseCategories } = req.body;

  // Validate incoming data
  if (!expenseTemplate || !expenseCategories || !Array.isArray(expenseCategories) || expenseCategories.length === 0) {
    return next(new AppError('Invalid request data', 400));
  }
  try {
    // Iterate through expenseCategories to create or update records
    const updatedCategories = await Promise.all(
      expenseCategories.map(async (category) => {
        // Check if the category already exists
        const existingCategory = await ExpenseTemplateApplicableCategories.findOne({
          expenseCategory: category.expenseCategory,
          expenseTemplate,
        });

        if (existingCategory) {
          // If the category exists, update it
          return ExpenseTemplateApplicableCategories.findByIdAndUpdate(
            existingCategory._id,
            { $set: { ...category } },
            { new: true }
          );
        } else {
          // If the category doesn't exist, create a new one
          const newCategory = new ExpenseTemplateApplicableCategories({
            expenseTemplate,
            ...category,
          });
          return newCategory.save();
        }
      })
    );

    res.status(201).json({
      status: 'success',
      data: updatedCategories,
      message: 'ExpenseTemplateApplicableCategories successfully created or updated',
    });
  } catch (err) {
    return next(new AppError('Internal server error', 500));
  }
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
exports.getAllExpenseTemplateApplicableCategories1 = catchAsync(async (req, res, next) => {
  const applicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: applicableCategories
  });
});
exports.getAllApplicableCategoriesByTemplateId = catchAsync(async (req, res, next) => {  
  const expenseTemplateApplicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(req.params.expenseTemplateId);
  res.status(200).json({
    status: 'success',
    data: expenseTemplateApplicableCategories,
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
   const employeeExpenseAssignmentExists = await EmployeeExpenseAssignment.find({}).where('user').equals(req.body.user).where('expenseTemplate').equals(req.body.expenseTemplate);
   var employeeExpenseAssignment;
   if (employeeExpenseAssignmentExists.length<=0) {
      employeeExpenseAssignment = await EmployeeExpenseAssignment.create(req.body);
   }
   else{
      employeeExpenseAssignment = await EmployeeExpenseAssignment.findByIdAndUpdate(
      employeeExpenseAssignmentExists[0]._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );   
   }
  
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
exports.getEmployeeExpenseAssignmentByUser = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.find({}).where('user').equals(req.params.userId);
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
