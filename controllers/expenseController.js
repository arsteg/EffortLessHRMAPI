
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
const ExpenseReportExpenseFields = require('../models/Expense/ExpenseReportExpenseFields');
const Advance = require('../models/Expense/ExpenseAdvance');
const AdvanceCategory = require('../models/Expense/AdvanceCategory'); 
const AdvanceTemplate = require('../models/Expense/AdvanceTemplate'); 
const AdvanceTemplateCategories = require('../models/Expense/AdvanceTemplateCategory'); 
const EmployeeAdvanceAssignment = require('../models/Expense/EmployeeAdvanceAssignment');
const userSubordinate = require('../models/userSubordinateModel');
const ExpenseTemplateCategoryFieldValues = require('../models/Expense/ExpenseTemplateCategoryFieldValues');
const User = require('../models/permissions/userModel');
const { ObjectId } = require('mongodb');
const AppError = require('../utils/appError');
const mongoose = require("mongoose");
const AdvanceTemplateCategory = require('../models/Expense/AdvanceTemplateCategory');
const ExpenseAdvance = require('../models/Expense/ExpenseAdvance');
const constants = require('../constants');
const StorageController = require('./storageController');
const  websocketHandler  = require('../utils/websocketHandler');

exports.createExpenseCategory = catchAsync(async (req, res, next) => {
    const { type, label , isMandatory} = req.body;
    const company = req.cookies.companyId;
  
    // Validate if company value exists in cookies
    if (!company) {
      return res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Company information missing in cookies',
      });
    }
    else
    {
      const expenseCategoryExists = await ExpenseCategory.findOne({ label: label });
      if(expenseCategoryExists)
      {
        res.status(500).json({
          status: constants.APIResponseStatus.Failure,
          message: 'Label already in use for another category',
        });
      }
      else{
      const expenseCategory = await ExpenseCategory.create({ type, label,isMandatory,company });
    
        res.status(201).json({
          status: constants.APIResponseStatus.Success,
          data: expenseCategory,
        });
      }
  }
 });  

exports.getExpenseCategory = catchAsync(async (req, res, next) => {
  const expenseCategory = await ExpenseCategory.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseCategory,
  });
});

exports.getExpenseCategoryByEmployee = catchAsync(async (req, res, next) => {
  try {
    const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({
      user: req.params.userId
    });   
   
    if (!userExpenseAssignment) {      
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: userExpenseAssignment,
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
      status: constants.APIResponseStatus.Success,
      data: expenseCategories,
      details: templateCategories
    });
  } catch (error) {
      res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: 'Internal server error'
    });
  }
});

exports.updateExpenseCategory = catchAsync(async (req, res, next) => {
  const expenseCategoryExists = await ExpenseCategory.findOne({ label: req.body.label, _id: { $ne: req.params.id }});
  if(expenseCategoryExists)
  {
      res.status(500).json({
      status: constants.APIResponseStatus.Failure,
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
        status: constants.APIResponseStatus.Success,
        data: expenseCategory,
      });
  }
});

exports.deleteExpenseCategory = catchAsync(async (req, res, next) => {
  const applicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseCategory').equals(req.params.id);
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseCategory').equals(req.params.id);  
  
  if (applicableCategories.length > 0 || expenseReportExpenses.length > 0) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
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
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllExpenseCategories = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  // Extract companyId from req.cookies
  const company = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  const query = { company: company };
   // Get the total count of documents matching the query
   const totalCount = await ExpenseCategory.countDocuments(query);

  const expenseCategories = await ExpenseCategory.find(query).skip(parseInt(skip))
  .limit(parseInt(limit));
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseCategories,
    total: totalCount
  });
});

exports.addExpenseApplicationField = catchAsync(async (req, res, next) => {
    const { expenseCategory, fields } = req.body;
    // Validate the incoming data
    if (!expenseCategory || !Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({
            status: constants.APIResponseStatus.Failure,
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
        status: constants.APIResponseStatus.Success,
        data: createdFields,
    });
});

exports.getExpenseApplicationField = catchAsync(async (req, res, next) => {
    const expenseApplicationField = await ExpenseApplicationField.findById(req.params.id);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
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
      status: constants.APIResponseStatus.Success,
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
  status: constants.APIResponseStatus.Success,
  data: expenseApplicationFields,
});
});

exports.createExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const { expenseApplicationField , expenseApplicationFieldValues } = req.body;
  // Validate the incoming data
  if (!expenseApplicationField || !Array.isArray(expenseApplicationFieldValues) || expenseApplicationFieldValues.length === 0) {
      return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
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
      status: constants.APIResponseStatus.Success,
      data: createdFields,
  });  
});

exports.getExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.findById(req.params.id);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
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
    status: constants.APIResponseStatus.Success,
    data: updatedFields,
  });
});

exports.deleteExpenseApplicationFieldValue = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldValue = await ExpenseApplicationFieldValue.findByIdAndDelete(req.params.id);
  if (!expenseApplicationFieldValue) {
    return next(new AppError('ExpenseApplicationFieldValue not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getExpenseApplicationFieldValuesByFieldId = catchAsync(async (req, res, next) => {
  const expenseApplicationFieldId = req.params.expenseApplicationFieldId;
  const expenseApplicationFieldValues = await ExpenseApplicationFieldValue.find({ expenseApplicationField: expenseApplicationFieldId });
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseApplicationFieldValues
  });
});

exports.createExpenseTemplate = catchAsync(async (req, res, next) => {
  const { expenseCategories, ...expenseTemplateData } = req.body;

  // Check if policyLabel is provided
  if (!expenseTemplateData.policyLabel) {
    return next(new AppError('Policy Label is required', 400));
  }

  // Check if policyLabel already exists
  const existingTemplate = await ExpenseTemplate.findOne({ 'policyLabel': expenseTemplateData.policyLabel });

  if (existingTemplate) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Policy Label already exists',
    });
  }
  if (!Array.isArray(expenseCategories) || expenseCategories.length === 0) {
    return next(new AppError('Expense Category Not Exists in Request', 400));
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  for (const category of expenseCategories) {
    const result = await ExpenseCategory.findById(category.expenseCategory);
    if (!result) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Invalid Category',
      });
    }
  }
  // Add companyId to the request body
  expenseTemplateData.company = companyId;
  const expenseTemplate = await ExpenseTemplate.create(expenseTemplateData);
  
  const expenseTemplateCategories =  await updateOrCreateExpenseTemplateCategories(expenseTemplate._id, expenseCategories);
 
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: expenseTemplate,
    categories: expenseTemplateCategories
  });
});


async function createExpenseTemplateCategories(expenseTemplateId, expenseCategories) {
  try {
    const updatedCategories = await Promise.all(
      expenseCategories.map(async (category) => {
        const existingCategory = await ExpenseTemplateApplicableCategories.findOne({
          expenseCategory: category.expenseCategory,
          expenseTemplate: expenseTemplateId,
        });

        if (existingCategory) {
          const insertedFields = await insertFields(existingCategory, category.expenseTemplateCategoryFieldValues);
          delete category._id;
          // Update the existing category document with newly inserted fields
          return ExpenseTemplateApplicableCategories.findByIdAndUpdate(
            existingCategory._id,
            { $set: { ...category, expenseTemplateCategoryFieldValues: insertedFields } },
            { new: true }
          );
        } else {
          // Create a new category document
          const newCategory = new ExpenseTemplateApplicableCategories({
            expenseTemplate: expenseTemplateId,
            ...category,
          });

          // Insert new fields into ExpenseTemplateCategoryFieldValues collection
          const insertedFields = await insertFields(newCategory, category.expenseTemplateCategoryFieldValues);

          // Update the new category document with the inserted fields
          newCategory.expenseTemplateCategoryFieldValues = insertedFields;

          // Save the new category document
          await newCategory.save();

          return newCategory;
        }
      })
    );

    return updatedCategories;
  } catch (err) {
    console.log(err)
    throw new AppError('Internal server error', 500);
  }
}

async function insertFields(category, expenseTemplateCategoryFieldValues) {
   await ExpenseTemplateCategoryFieldValues.deleteMany({ expenseTemplateCategory: category._id });

  if (expenseTemplateCategoryFieldValues.length === 0) {
    return []; // Return an empty array if there are no fields to insert
  } else {
    // Insert new fields into ExpenseTemplateCategoryFieldValues collection
    return ExpenseTemplateCategoryFieldValues.insertMany(expenseTemplateCategoryFieldValues.map(field => ({ expenseTemplateCategory: category._id, ...field })));
  }
}

// Example usage in Express.js route
app.post('/createExpenseTemplateCategories', async (req, res) => {
  const { expenseTemplateId, expenseCategories } = req.body;
  try {
    const updatedCategories = await createExpenseTemplateCategories(expenseTemplateId, expenseCategories);
    res.json(updatedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


exports.getExpenseTemplate = catchAsync(async (req, res, next) => {
  const expenseTemplate = await ExpenseTemplate.findById(req.params.id);
  const expenseTemplateApplicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(req.params.id);
  expenseTemplate.applicableCategories=expenseTemplateApplicableCategories;
    res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseTemplate
  });
});

exports.updateExpenseTemplate = catchAsync(async (req, res, next) => {
  const { expenseCategories, ...expenseTemplateData } = req.body;

  // Check if policyLabel is provided
  if (!expenseTemplateData.policyLabel) {
    return next(new AppError('Policy Label is required', 400));
  }

  // Check if policyLabel already exists
  const existingTemplate = await ExpenseTemplate.findOne({ 'policyLabel': expenseTemplateData.policyLabel ,_id: { $ne: req.params.id }});

  if (existingTemplate) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Policy Label already exists',
    });
  }
  if (!Array.isArray(expenseCategories) || expenseCategories.length === 0) {
    return next(new AppError('Expense Category Not Exists in Request', 400));
  }
  const expenseTemplate = await ExpenseTemplate.findByIdAndUpdate(req.params.id, expenseTemplateData, {
    new: true,
    runValidators: true
  });

  if (!expenseTemplate) {
    return next(new AppError('Expense Template not found', 404));
  }

  const updatedCategories = await updateOrCreateExpenseTemplateCategories(req.params.id, req.body.expenseCategories);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { expenseTemplate: expenseTemplate, expenseCategories: updatedCategories },
  });
});

async function updateOrCreateExpenseTemplateCategories(expenseTemplateId, updatedCategories) {
  const existingCategories = await ExpenseTemplateApplicableCategories.find({ expenseTemplate: expenseTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.expenseCategory.equals(category.expenseCategory)
    );
    if (!existingCategory) {
     // Create new category
      const newCategory = new ExpenseTemplateApplicableCategories({
        expenseTemplate: expenseTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.expenseCategory === existing.expenseCategory._id.toString())
  );
  

  const removalPromises = categoriesToRemove.map(async (category) => {
    return ExpenseTemplateApplicableCategories.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await ExpenseTemplateApplicableCategories.find({ expenseTemplate: expenseTemplateId });

  return finalCategories;
}

exports.deleteExpenseTemplate = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.find({}).where('expenseTemplate').equals(req.params.id);
  if (employeeExpenseAssignment.length > 0) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: 'Expense Template is already in use. Please delete related records before deleting the Expense Template.',
    });
  }
  
  const expenseTemplate = await ExpenseTemplate.findByIdAndDelete(req.params.id);
  
  if (!expenseTemplate) {
    return next(new AppError('Expense Template not found', 404));
  }
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllExpenseTemplates = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const query = { company: req.cookies.companyId };
   // Get the total count of documents matching the query
   const totalCount = await ExpenseTemplate.countDocuments(query);
  const expenseTemplates = await ExpenseTemplate.find(query).skip(parseInt(skip))
  .limit(parseInt(limit));

  if(expenseTemplates)
  {
   for(var i = 0; i < expenseTemplates.length; i++) {     
   const expenseTemplateApplicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(expenseTemplates[i]._id);  
   if(expenseTemplateApplicableCategories) 
      {
        expenseTemplates[i].applicableCategories=expenseTemplateApplicableCategories;
      }
      else{
        expenseTemplates[i].applicableCategories=null;
      }
   }
  }
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseTemplates,
    total: totalCount
  });
});

exports.createExpenseTemplateCategories = catchAsync(async (req, res, next) => {
   const { expenseTemplate, expenseCategories } = req.body;
  // Validate incoming data
  if (!expenseTemplate || !expenseCategories || !Array.isArray(expenseCategories) || expenseCategories.length === 0) {
    return next(new AppError('Invalid request data', 400));
  }
  for (const category of expenseCategories) {    
      const result = await ExpenseCategory.findById(category.expenseCategory);
      if (!result) {
        return res.status(400).json({
          status:constants.APIResponseStatus.Failure,
          message: 'Invalid Category',
        });      
    }
  }
  // Iterate through expenseCategories to create or update records
  const expenseTemplateCategories =  await createExpenseTemplateCategories(mongoose.Types.ObjectId(expenseTemplate), expenseCategories);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: expenseTemplateCategories     
    });
  
});

exports.getAllExpenseTemplateApplicableCategories = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  const applicableCategories = await ExpenseTemplateApplicableCategories.find({ company: companyId });
  if(applicableCategories) 
      {
        
          for(var i = 0; i < applicableCategories.length; i++) {     
            
          const expenseTemplateCategoryFieldValues = await ExpenseTemplateCategoryFieldValues.find({}).where('expenseTemplateCategory').equals(applicableCategories[i]._id);  
          if(expenseTemplateCategoryFieldValues) 
            {
              applicableCategories[i].expenseTemplateCategoryFieldValues = expenseTemplateCategoryFieldValues;
            }
            else{
              applicableCategories[i].expenseTemplateCategoryFieldValues=null;
            }
          }
      }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: applicableCategories
  });
});

exports.getAllApplicableCategoriesByTemplateId = catchAsync(async (req, res, next) => {  
  const applicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(req.params.expenseTemplateId);
  if(applicableCategories) 
  {
    
      for(var i = 0; i < applicableCategories.length; i++) {    
      const expenseTemplateCategoryFieldValues = await ExpenseTemplateCategoryFieldValues.find({}).where('expenseTemplateCategory').equals(applicableCategories[i]._id);  
      if(expenseTemplateCategoryFieldValues) 
        {
          applicableCategories[i].expenseTemplateCategoryFieldValues = expenseTemplateCategoryFieldValues;
        }
        else{
          applicableCategories[i].expenseTemplateCategoryFieldValues=null;
        }
      }
  } res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: applicableCategories,
  });
});
exports.getApplicableCategoryByTemplateAndCategoryId = catchAsync(async (req, res, next) => {  

  const applicableCategories = await ExpenseTemplateApplicableCategories.findOne({
    expenseCategory: req.params.expenseCategory,
    expenseTemplate: req.params.expenseTemplate
  });  
 
  if(applicableCategories) 
  {
      const expenseTemplateCategoryFieldValues = await ExpenseTemplateCategoryFieldValues.find({}).where('expenseTemplateCategory').equals(applicableCategories._id);  
        if(expenseTemplateCategoryFieldValues) 
        {
          applicableCategories.expenseTemplateCategoryFieldValues = expenseTemplateCategoryFieldValues;
        }
        else{
          applicableCategories.expenseTemplateCategoryFieldValues=null;
        }
      
  } res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: applicableCategories,
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
   const employeeExpenseAssignmentExists = await EmployeeExpenseAssignment.find({}).where('user').equals(req.body.user);
   var employeeExpenseAssignment;
   const expenseTemplate=await ExpenseTemplate.findById(req.body.expenseTemplate);   
   if (expenseTemplate && expenseTemplate.approvalType == "template-wise")
   {    
         req.body.primaryApprover = expenseTemplate.firstApprovalEmployee;
         req.body.secondaryApprover = expenseTemplate.secondApprovalEmployee;      
   }  
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
    status: constants.APIResponseStatus.Success,
    data: employeeExpenseAssignment,
  });
});

exports.getEmployeeExpenseAssignment = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.findById(req.params.id);
  if (!employeeExpenseAssignment) {
    return next(new AppError('EmployeeExpenseAssignment not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeExpenseAssignment,
  });
});
exports.getEmployeeExpenseAssignmentByUser = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.find({}).where('user').equals(req.params.userId);
  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeExpenseAssignment,
  });
});

exports.getApplicableExpenseSettingByUser = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.findOne({user:req.params.userId});
  var expenseTemplate=[];
  if (employeeExpenseAssignment) {
   
  expenseTemplate = await ExpenseTemplate.findById(employeeExpenseAssignment.expenseTemplate);   
  const expenseTemplateApplicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(employeeExpenseAssignment.expenseTemplate);
  expenseTemplate.applicableCategories = expenseTemplateApplicableCategories;
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseTemplate,
  });
});
exports.updateEmployeeExpenseAssignment = catchAsync(async (req, res, next) => {

const expenseReport = await ExpenseReport.find({}).where('employee').equals( req.body.user).where('status').nin(['Approved', 'Rejected','Cancelled']); // Filter by status
  ;
  if (expenseReport.length>0) {
    return next(new AppError('Expenses Need to close first before delete assignment', 404));
  }
  const expenseTemplate=await ExpenseTemplate.findById(req.body.expenseTemplate);   
  if (expenseTemplate && expenseTemplate.approvalType == "template-wise")
      {    
            req.body.primaryApprover = expenseTemplate.firstApprovalEmployee;
            req.body.secondaryApprover = expenseTemplate.secondApprovalEmployee;      
      }  
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
    status: constants.APIResponseStatus.Success,
    data: employeeExpenseAssignment,
  });
});

exports.deleteEmployeeExpenseAssignment = catchAsync(async (req, res, next) => {
  
//validation
const userExpenseAssignment = await EmployeeExpenseAssignment.findById(req.params.id);   
if (!userExpenseAssignment) {
  return next(new AppError('EmployeeExpenseAssignment not found', 404));
}
const expenseReport = await ExpenseReport.find({}).where('employee').equals(userExpenseAssignment.user).where('status').nin(['Approved', 'Rejected','Cancelled']); // Filter by status
;
if (expenseReport.length>0) {
  return next(new AppError('Expenses Need to close first before delete assignment', 404));
}
 await EmployeeExpenseAssignment.findByIdAndDelete(req.params.id);  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllEmployeeExpenseAssignments = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const query = { company: req.cookies.companyId };
   // Get the total count of documents matching the query
   const totalCount = await EmployeeExpenseAssignment.countDocuments(query);
  const employeeExpenseAssignments = await EmployeeExpenseAssignment.find(query).skip(parseInt(skip))
  .limit(parseInt(limit));

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeExpenseAssignments,
    total: totalCount
  });
});

exports.createExpenseReport = catchAsync(async (req, res, next) => {
  // Extract data from the request body
  const { employee, title, status,amount, expenseReportExpenses } = req.body;  
  try {
    // Create ExpenseReport
    const expenseReport = await ExpenseReport.create({
      employee,
      title,
      status,
      amount,
      company: req.cookies.companyId
      });

    // Create ExpenseReportExpenses and associated ExpenseReportExpenseFields
    expenseReport.expenseReportExpense = await Promise.all(
      expenseReportExpenses.map(async (expenseData) => {
        const { expenseCategory, incurredDate,expenseTemplateCategoryFieldValues,type,quantity, amount, isReimbursable, isBillable, reason, expenseAttachments, expenseReportExpenseFields } = expenseData;
        if(expenseAttachments!=null)
        {
        for(var i = 0; i < expenseAttachments.length; i++) {
          if (!expenseAttachments[i].attachmentType || !expenseAttachments[i].attachmentName || !expenseAttachments[i].attachmentSize || !expenseAttachments[i].extention || !expenseAttachments[i].file
            ||expenseAttachments[i].attachmentType===null || expenseAttachments[i].attachmentName===null || expenseAttachments[i].attachmentSize===null || expenseAttachments[i].extention === null || expenseAttachments[i].file===null) {
            return res.status(400).json({ error: 'All attachment properties must be provided' });
          }
          const id = Date.now().toString(36);
          expenseAttachments[i].filePath = expenseAttachments[i].attachmentName +"_" + id + expenseAttachments[i].extention; 
          //req.body.attachment.file = req.body.taskAttachments[i].file;
          var documentLink = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.ExpenseAttachment, expenseAttachments[i]);
          }
        }
        const expense = await ExpenseReportExpense.create({
          expenseReport: expenseReport._id,
          expenseCategory,
          incurredDate,
          expenseTemplateCategoryFieldValues,
          type,
          quantity,
          amount,
          isReimbursable: isReimbursable || true,
          isBillable: isBillable || false,
          reason,
          documentLink
        });
        // Create ExpenseReportExpenseFields for each expense
        if (expenseReportExpenseFields && expenseReportExpenseFields.length > 0) {
          expense.expenseReportExpenseFields = await ExpenseReportExpenseFields.insertMany(
            expenseReportExpenseFields.map((field) => ({
              expenseReportExpense: expense._id,
              expenseApplicationField: field.expenseApplicationField,
              type: field.type,
              value: field.value,
              fromDate:field.fromDate,
              toDate:field.toDate
            }))
          );
        }
        return expense;
      })
    );

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        expenseReport
      },
      message: 'ExpenseReport successfully created',
    });
  } catch (error) {
    console.error(error);
    next(new AppError('Internal server error', 500));
  }
});

exports.getExpenseReport = catchAsync(async (req, res, next) => {
const expenseReport = await ExpenseReport.findById(req.params.id);
const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.id);
  if(expenseReportExpenses) 
  {
      for(var i = 0; i < expenseReportExpenses.length; i++) {     
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);  
      if(expenseReportExpenseFields) 
        {
          expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
        }
        else{
          expenseReportExpenses[i].expenseReportExpenseFields=null;
        }
      }
      expenseReport.expenseReportExpense=expenseReportExpenses;
   }  
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: expenseReport,
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
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.id);
  if(expenseReportExpenses) 
  {
      for(var i = 0; i < expenseReportExpenses.length; i++) {     
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);  
      if(expenseReportExpenseFields) 
        {
          expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
        }
        else{
          expenseReportExpenses[i].expenseReportExpenseFields=null;
        }
      }
      expenseReport.expenseReportExpense=expenseReportExpenses;
   }  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReport
  });
});

exports.deleteExpenseReport = catchAsync(async (req, res, next) => {
   const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.id);  
  if (expenseReportExpenses.length > 0) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: 'Expense Report is already in use. Please delete related records before deleting the Expense Report.',
    });
  }
  const expenseReport = await ExpenseReport.findByIdAndDelete(req.params.id);

  if (!expenseReport) {
    return next(new AppError('ExpenseReport not found', 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getExpenseReportsByUser = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  
  const query = { employee: req.params.userId };
  if (req.body.status) {
    query.status = req.body.status;
  }
   // Get the total count of documents matching the query
   const totalCount = await ExpenseReport.countDocuments(query);
  const expenseReports = await ExpenseReport.find(query).skip(parseInt(skip))
  .limit(parseInt(limit));
  for(var j = 0; j < expenseReports.length; j++) {     
     {
      const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(expenseReports[j]._id);
      if(expenseReportExpenses) 
      {
          for(var i = 0; i < expenseReportExpenses.length; i++) {     
          const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);  
          if(expenseReportExpenseFields) 
            {
              expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
            }
            else{
              expenseReportExpenses[i].expenseReportExpenseFields=null;
            }
          }
        }
          expenseReports[j].expenseReportExpense=expenseReportExpenses;
      }  
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReports,
    total: totalCount
  });
});

exports.getExpenseReportsByTeam = catchAsync(async (req, res, next) => {
  var teamIdsArray = [];
  var teamIds;
  const ids = await userSubordinate.find({}).distinct('subordinateUserId').where('userId').equals(req.cookies.userId);  
  if(ids.length > 0)    
      { 
        for(var i = 0; i < ids.length; i++) 
          {    
              teamIdsArray.push(ids[i]);        
          }
    }
  if(teamIds==null)    
    {
       teamIdsArray.push(req.cookies.userId);
    } 
   
    const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
    const query = { employee: { $in: objectIdArray } };
    if (req.body.status) {
      query.status = req.body.status;
    }
    const totalCount = await ExpenseReport.countDocuments(query);

    // Get the regularization requests matching the query with pagination
    const expenseReports = await ExpenseReport.find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit));
 
  for(var j = 0; j < expenseReports.length; j++) {     
     {
      const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(expenseReports[j]._id);
      if(expenseReportExpenses) 
      {
          for(var i = 0; i < expenseReportExpenses.length; i++) {     
          const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);  
          if(expenseReportExpenseFields) 
            {
              expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
            }
            else{
              expenseReportExpenses[i].expenseReportExpenseFields=null;
            }
          }
        }
          expenseReports[j].expenseReportExpense=expenseReportExpenses;
      }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReports,
    total: totalCount
  });
});

exports.getAllExpenseReports = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { company: req.cookies.companyId };
  if (req.body.status) {
    query.status = req.body.status;
  }
  const totalCount = await ExpenseReport.countDocuments(query);

 
  const expenseReports = await ExpenseReport.find(query).skip(parseInt(skip))
  .limit(parseInt(limit));
  for(var j = 0; j < expenseReports.length; j++) {     
     {
      const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(expenseReports[j]._id);
      if(expenseReportExpenses) 
      {
          for(var i = 0; i < expenseReportExpenses.length; i++) {     
          const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);  
          if(expenseReportExpenseFields) 
            {
              expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
            }
            else{
              expenseReportExpenses[i].expenseReportExpenseFields=null;
            }
          }
        }
          expenseReports[j].expenseReportExpense=expenseReportExpenses;
      }  
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReports,
    total: totalCount
  });
});

exports.createExpenseReportExpense = catchAsync(async (req, res, next) => {
  // Create ExpenseReportExpense
  const expenseAttachments = req.body.expenseAttachments;
  var documentLink;
  for(var i = 0; i < expenseAttachments.length; i++) {
          if (!expenseAttachments[i].attachmentType || !expenseAttachments[i].attachmentName || !expenseAttachments[i].attachmentSize || !expenseAttachments[i].extention || !expenseAttachments[i].file
            ||expenseAttachments[i].attachmentType===null || expenseAttachments[i].attachmentName===null || expenseAttachments[i].attachmentSize===null || expenseAttachments[i].extention === null || expenseAttachments[i].file===null) {
            return res.status(400).json({ error: 'All attachment properties must be provided' });
          }
          const id = Date.now().toString(36);
          expenseAttachments[i].filePath = expenseAttachments[i].attachmentName +"_" + id + expenseAttachments[i].extention; 
            //req.body.attachment.file = req.body.taskAttachments[i].file;
          var documentLink = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.ExpenseAttachment, expenseAttachments[i]);
         
          req.body.documentLink=documentLink;
  }
  const expenseReportExpense = await ExpenseReportExpense.create(req.body);

  // Create ExpenseReportExpenseFields if provided
  if (req.body.expenseReportExpenseFields && req.body.expenseReportExpenseFields.length > 0) {
    const expenseReportExpenseFields = req.body.expenseReportExpenseFields.map((field) => ({
      expenseReportExpense: expenseReportExpense._id,
      expenseApplicationField: field.expenseApplicationField,
      type: field.type,
      value: field.value,
      fromDate:field.fromDate,
      toDate:field.toDate
    }));

    await ExpenseReportExpenseFields.insertMany(expenseReportExpenseFields);
  }

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReportExpense,
  });
});

exports.getExpenseReportExpense = catchAsync(async (req, res, next) => {
  const expenseReportExpense = await ExpenseReportExpense.findById(req.params.id);
  if(expenseReportExpense)
  {        
  const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpense._id);    
  if(expenseReportExpenseFields) 
    {
      expenseReportExpense.expenseReportExpenseFields=expenseReportExpenseFields;
    }
    else{
      expenseReportExpense.expenseReportExpenseFields=null;
    }
  
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReportExpense
  });
});

exports.updateExpenseReportExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const expenseAttachments = req.body.expenseAttachments;
  
  var documentLink;
  for(var i = 0; i < expenseAttachments.length; i++) {
          if (!expenseAttachments[i].attachmentType || !expenseAttachments[i].attachmentName || !expenseAttachments[i].attachmentSize || !expenseAttachments[i].extention || !expenseAttachments[i].file
            ||expenseAttachments[i].attachmentType===null || expenseAttachments[i].attachmentName===null || expenseAttachments[i].attachmentSize===null || expenseAttachments[i].extention === null || expenseAttachments[i].file===null) {
            return res.status(400).json({ error: 'All attachment properties must be provided' });
          }
          const id = Date.now().toString(36);
          expenseAttachments[i].filePath = expenseAttachments[i].attachmentName +"_" + id + expenseAttachments[i].extention; 
          //req.body.attachment.file = req.body.taskAttachments[i].file;
       var documentLink = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.ExpenseAttachment, expenseAttachments[i]);  
       req.body.documentLink=documentLink;
  }
  // Update ExpenseReportExpense
  const updatedExpenseReportExpense = await ExpenseReportExpense.findByIdAndUpdate(id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Run Mongoose validators
  });

  if (!updatedExpenseReportExpense) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Expense Report Expense not found',
    });
  }

  // Update or create ExpenseReportExpenseFields
  const { expenseReportExpenseFields } = req.body;

  if (expenseReportExpenseFields && expenseReportExpenseFields.length > 0) {  
    const updatedFields = await Promise.all(
      expenseReportExpenseFields.map(async (field) => {  
        if (field.id) {
          // If ID is present, update existing ExpenseReportExpenseFields
          return ExpenseReportExpenseFields.findByIdAndUpdate(field.id, {
            expenseApplicationField: field.expenseApplicationField,
            type: field.type,
            value: field.value,
            fromDate:field.fromDate,
            toDate:field.toDate
          });
        } else {
          // If ID is not present, create new ExpenseReportExpenseFields
          return ExpenseReportExpenseFields.create({
            expenseReportExpense: id,
            expenseApplicationField: field.expenseApplicationField,
            type: field.type,
            value: field.value,
            fromDate:field.fromDate,
            toDate:field.toDate
          });
        }
      })
    );
    // Remove ExpenseReportExpenseFields not present in the request
    const fieldIdsToUpdate = updatedFields.map((field) => field.id);
    await ExpenseReportExpenseFields.deleteMany({
      expenseReportExpense: id,
      _id: { $nin: fieldIdsToUpdate },
    });
  } else {
    // If no expenseReportExpenseFields in the request, delete all existing ones
    await ExpenseReportExpenseFields.deleteMany({ expenseReportExpense: id });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedExpenseReportExpense,
  });
});


exports.deleteExpenseReportExpense = catchAsync(async (req, res, next) => {
  const expenseReportExpense = await ExpenseReportExpense.findByIdAndDelete(req.params.id);
  if (!expenseReportExpense) {
    return next(new AppError('Expense Report Expense not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllExpenseReportExpensesByExpenseReport = catchAsync(async (req, res, next) => {
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.expenseReportId);
  if(expenseReportExpenses)
  {
      for(var i = 0; i < expenseReportExpenses.length; i++) {     
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);  
      if(expenseReportExpenseFields) 
        {
          expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
        }
        else{
          expenseReportExpenses[i].expenseReportExpenseFields=null;
        }
      }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReportExpenses
  });
});

exports.getAllExpenseReportExpenses = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { company: req.cookies.companyId };
  const totalCount = await ExpenseReport.countDocuments(query); 

  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));
  if(expenseReportExpenses) 
  {
      for(var i = 0; i < expenseReportExpenses.length; i++) {     
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);  
      if(expenseReportExpenseFields) 
        {
          expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
        }
        else{
          expenseReportExpenses[i].expenseReportExpenseFields=null;
        }
      }
   }  
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReportExpenses,
    total: totalCount
  });
});
exports.createAdvance = catchAsync(async (req, res, next) => {
    // Extract companyId from req.cookies
    const companyId = req.cookies.companyId;
    // Check if companyId exists in cookies
    if (!companyId) {
      return next(new AppError('Company ID not found in cookies', 400));
    }
    // Add companyId to the request body
    req.body.company = companyId;
    const { employee, category,amount,comment } = req.body;

  
    // Create ExpenseReport
    const advance = await Advance.create({
      employee,
      category,
      amount,
      comment,
      company: req.cookies.companyId,
      status: 'Level 1 Approval Pending' // Assuming company ID is stored in cookies
    });

     res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: advance
    });
});

exports.getAdvance = catchAsync(async (req, res, next) => {
    const advance = await Advance.findById(req.params.id);   
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: advance
    });
});

exports.getAdvanceCategoryByEmployee = catchAsync(async (req, res, next) => {
  try {    
    // Retrieve applicable categories for the expense template
    const assignment = await EmployeeAdvanceAssignment.findOne({
      user: req.params.userId
    });
    
    const templateCategories = assignment ? await AdvanceTemplateCategory.find({}).where('advanceTemplate').equals(assignment.advanceTemplate) : [];
    res.status(200).json({
      status: constants.APIResponseStatus.Success,     
      details: templateCategories
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: 'Internal server error'
    });
  }
});

exports.updateAdvance = catchAsync(async (req, res, next) => {
    const advance = await Advance.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });  
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: advance
    });
});

exports.deleteAdvance = catchAsync(async (req, res, next) => {
    const advance = await Advance.findByIdAndDelete(req.params.id);   
    res.status(204).json({
        status: constants.APIResponseStatus.Success,
        data: null
    });
});

exports.getAllAdvances = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { company: req.cookies.companyId };

  if (req.body.status) {
    query.status = req.body.status;
  }
  const totalCount = await Advance.countDocuments(query); 
  const advances = await Advance.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
    res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: advances,
        total: totalCount
    });
});

exports.getAdvanceSummaryByEmployee = catchAsync(async (req, res, next) => {
  try {
    const expenseAdvancelist = await Advance.find({}).where('employee').equals(req.params.userId);    
   
    if (!expenseAdvancelist) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Expense Advance not found for the given user.'
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,     
      details: expenseAdvancelist
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: 'Internal server error'
    });
  }
});
exports.createAdvanceCategory = catchAsync(async (req, res, next) => {
  const { label} = req.body;
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
  else
  {
  const advanceCategoryExists = await AdvanceCategory.findOne({ label: label, company: company });
  if(advanceCategoryExists)
    {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Label already in use for another category',
      });
    }
    else{
    const advanceCategory = await AdvanceCategory.create({ label,company });
  
      res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: advanceCategory,
      });
    }
}
});  

exports.getAdvanceCategory = catchAsync(async (req, res, next) => {
const advanceCategory = await AdvanceCategory.findById(req.params.id);
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: advanceCategory,
});
});

exports.updateAdvanceCategory = catchAsync(async (req, res, next) => {
const advanceCategoryExists = await AdvanceCategory.findOne({ label: req.body.label, _id: { $ne: req.params.id }});
if(advanceCategoryExists)
{
    res.status(500).json({
    status: constants.APIResponseStatus.Failure,
    message: 'Label already in use for another category',
  });
}
else
{
    const advanceCategory = await AdvanceCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: advanceCategory,
    });
}
});

exports.deleteAdvanceCategory = catchAsync(async (req, res, next) => {

const advanceCategoryInstance = await AdvanceCategory.findById(req.params.id);
await advanceCategoryInstance.remove();
if (!advanceCategoryInstance) {
  return next(new AppError('Expense category not found', 404));
}

return res.status(204).json({
  status: constants.APIResponseStatus.Success,
  data: null,
});
});

exports.getAllAdvanceCategories = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { company: req.cookies.companyId };
  const totalCount = await AdvanceCategory.countDocuments(query); 
  const advanceCategories = await AdvanceCategory.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));


res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: advanceCategories,
  total: totalCount
});
});

exports.createAdvanceTemplate = async (req, res, next) => {
  
    // Extract data from the request body
    const {
      policyLabel,
      approvalType,
      approvalLevel,
      firstApprovalEmployee,
      secondApprovalEmployee,
      advanceCategories,
    } = req.body;

    const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
    if (!Array.isArray(advanceCategories) || advanceCategories.length === 0) {
      return next(new AppError('Advance Category Not Exists in Request', 400));
    }
    else
    {
      const advanceCategoryExists = await AdvanceTemplate.findOne({ policyLabel: policyLabel, company: company });    
      if(advanceCategoryExists)
        {
          res.status(500).json({
            status:constants.APIResponseStatus.Failure,
            message: 'Label already in use for another category',
          });
        }
        else
        {
          { // Create the AdvanceTemplate document
            const advanceTemplate = await AdvanceTemplate.create({
              policyLabel,
              approvalType,
              approvalLevel,
              firstApprovalEmployee,
              secondApprovalEmployee,
              company: company, // Assuming user information is available in req.user
            });
            for (const category of advanceCategories) {
              const result = await AdvanceCategory.findById(category.advanceCategory);
              if (!result) {
                return res.status(400).json({
                  status: constants.APIResponseStatus.Failure,
                  message: 'Invalid Category',
                });
              }
            }
            // Create the AdvanceTemplateCategories documents
            if (advanceCategories && advanceCategories.length > 0) {
              const createdCategories = await AdvanceTemplateCategories.insertMany(
                advanceCategories.map(category => ({
                  advanceTemplate: advanceTemplate._id,
                  advanceCategory: category.advanceCategory,
                }))
              );
              advanceTemplate.advanceCategories = createdCategories.map(category => category._id);
              await advanceTemplate.save();
            } // Send a success response
            res.status(201).json({
              status: constants.APIResponseStatus.Success,
              data: advanceTemplate,
            });
            } 
          }
        }
};

exports.getAdvanceTemplate = catchAsync(async (req, res, next) => {
 
  const advanceTemplate = await AdvanceTemplate.findById(req.params.id);
  if(advanceTemplate) {  
       const advanceTemplateCategories = await AdvanceTemplateCategory.find({})
        .where('advanceTemplate').equals(advanceTemplate._id);    
      if(advanceTemplateCategories && advanceTemplateCategories.length) {
        advanceTemplate.advanceCategories = advanceTemplateCategories;
      } else {
        advanceTemplate.advanceCategories = null;
      }    
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: advanceTemplate
  });
});


exports.updateAdvanceTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the AdvanceTemplate by ID
    const advanceTemplate = await AdvanceTemplate.findById(id);

    if (!advanceTemplate) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Advance Template not found',
      });
    }

    // Extract updated data from the request body
    const {
      policyLabel,
      approvalLevel,
      firstApprovalEmployee,
      secondApprovalEmployee,
      approvalType,
      advanceCategories,
    } = req.body;

    // Update AdvanceTemplate fields
    advanceTemplate.policyLabel = policyLabel || advanceTemplate.policyLabel;
    advanceTemplate.approvalLevel = approvalLevel || advanceTemplate.approvalLevel;
    advanceTemplate.firstApprovalEmployee =
      firstApprovalEmployee || advanceTemplate.firstApprovalEmployee;
    advanceTemplate.secondApprovalEmployee =
      secondApprovalEmployee || advanceTemplate.secondApprovalEmployee;
    advanceTemplate.approvalType = approvalType || advanceTemplate.approvalType;

    // Save the updated AdvanceTemplate
    await advanceTemplate.save();
    if (!Array.isArray(advanceCategories) || advanceCategories.length === 0) {
      return next(new AppError('Advance Category Not Exists in Request', 400));
    }
    for (const category of advanceCategories) {
      const result = await AdvanceCategory.findById(category.advanceCategory);
      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: 'Invalid Category',
        });
      }
    }
    // Update expense categories
    if (advanceCategories && advanceCategories.length > 0) {
      // Delete old expense categories for this template
      await AdvanceTemplateCategories.deleteMany({ advanceTemplate: advanceTemplate._id });

      // Create and add new expense categories for this template
      const createdCategories = await AdvanceTemplateCategories.insertMany(
        advanceCategories.map(category => ({
          advanceTemplate: advanceTemplate._id,
          advanceCategory: category.advanceCategory,
        }))
      );
      advanceTemplate.advanceCategories = createdCategories.map(category => category._id);
      await advanceTemplate.save();
    }
        // Send a success response
        res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: advanceTemplate,
        });
      } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({
          status: constants.APIResponseStatus.Error,
          message: 'Internal server error',
        });
      };
    };

exports.deleteAdvanceTemplate = catchAsync(async (req, res, next) => { 
  
  const advanceTemplate = await AdvanceTemplate.findByIdAndDelete(req.params.id);
  
  if (!advanceTemplate) {
    return next(new AppError('Expense Template not found', 404));
  }
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllAdvanceTemplates = catchAsync(async (req, res, next) => {

  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { company: req.cookies.companyId };
  const totalCount = await AdvanceTemplate.countDocuments(query); 
  const advanceTemplates = await AdvanceTemplate.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
    .limit(parseInt(limit));
  if(advanceTemplates) {
    for(var i = 0; i < advanceTemplates.length; i++) {
      const AdvanceTemplateCategories = await AdvanceTemplateCategory.find({})
        .where('advanceTemplate').equals(advanceTemplates[i]._id);

      if(AdvanceTemplateCategories && AdvanceTemplateCategories.length) {
        advanceTemplates[i].advanceCategories = AdvanceTemplateCategories;
      } else {
        advanceTemplates[i].advanceCategories = null;
      }
    }
  }
   res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: advanceTemplates,
    total: totalCount
  });
});

exports.createEmployeeAdvanceAssignment = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
   // Check if the user exists
   const userExists = await User.findById(req.body.user);
   if (!userExists) {
     return next(new AppError('User not found', 404));
   }
 
   // Check if the advance template exists
   const advanceTemplateExists = await AdvanceTemplate.findById(req.body.advanceTemplate);
   if (!advanceTemplateExists) {
     return next(new AppError('Advance template not found', 404));
   }
  const employeeAdvanceAssignmentExists = await EmployeeAdvanceAssignment.find({}).where('user').equals(req.body.user);
  var employeeAdvanceAssignment;
  if (employeeAdvanceAssignmentExists.length<=0) {
    employeeAdvanceAssignment = await EmployeeAdvanceAssignment.create(req.body);
  }
  else{
    employeeAdvanceAssignment = await EmployeeAdvanceAssignment.findByIdAndUpdate(
      employeeAdvanceAssignmentExists[0]._id,
     req.body,
     {
       new: true,
       runValidators: true,
     }
   );   
  }
 
 res.status(201).json({
   status: constants.APIResponseStatus.Success,
   data: employeeAdvanceAssignment,
 });
});

exports.getEmployeeAdvanceAssignment = catchAsync(async (req, res, next) => {
 const employeeAdvanceAssignment = await EmployeeAdvanceAssignment.findById(req.params.id);
 if (!employeeAdvanceAssignment) {
   return next(new AppError('EmployeeAdavanceAssignment not found', 404));
 }
 res.status(200).json({
   status: constants.APIResponseStatus.Success,
   data: employeeAdvanceAssignment,
 });
});

exports.getEmployeeAdvanceAssignmentByUser = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { user: req.params.userId };
  const totalCount = await EmployeeAdvanceAssignment.countDocuments(query); 
  const employeeAdvanceAssignment = await EmployeeAdvanceAssignment.find({}).where('user').equals(req.params.userId).skip(parseInt(skip))
    .limit(parseInt(limit));

 if (!employeeAdvanceAssignment) {
   return next(new AppError('EmployeeAdvanceAssignment not found', 404));
 }
 res.status(200).json({
   status: constants.APIResponseStatus.Success,
   data: employeeAdvanceAssignment,
   total: totalCount
 });
});

exports.updateEmployeeAdvanceAssignment = catchAsync(async (req, res, next) => {
   // Check if the user exists
   const userExists = await User.findById(req.body.user);
   if (!userExists) {
     return next(new AppError('User not found', 404));
   }
 
   // Check if the advance template exists
   const advanceTemplateExists = await AdvanceTemplate.findById(req.body.advanceTemplate);
   if (!advanceTemplateExists) {
     return next(new AppError('Advance template not found', 404));
   }

 const employeeAdvanceAssignment = await EmployeeAdvanceAssignment.findByIdAndUpdate(
   req.params.id,
   req.body,
   {
     new: true,
     runValidators: true,
   }
 );

 if (!employeeAdvanceAssignment) {
   return next(new AppError('EmployeeAdvanceAssignment not found', 404));
 }

 res.status(200).json({
   status: constants.APIResponseStatus.Success,
   data: employeeAdvanceAssignment,
 });
});

exports.deleteEmployeeAdvanceAssignment = catchAsync(async (req, res, next) => {
  const employeeAdvanceAssignment = await EmployeeAdvanceAssignment.findById(req.params.id);   
if (!employeeAdvanceAssignment) {
  return next(new AppError('EmployeeAdvanceAssignment not found', 404));
}
const advanceReport = await ExpenseAdvance.find({}).where('employee').equals(employeeAdvanceAssignment.user).where('status').in(['Approved', 'Rejected','Cancelled']); // Filter by status
;
if (advanceReport.length>0) {
  return next(new AppError('Expenses Need to close first before delete assignment', 404));
}
await EmployeeAdvanceAssignment.findByIdAndDelete(req.params.id);
 res.status(204).json({
   status: constants.APIResponseStatus.Success,
   data: null,
 });
});

exports.getAllEmployeeAdvanceAssignments = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { company: req.cookies.companyId };
  const totalCount = await EmployeeAdvanceAssignment.countDocuments(query);  

 const employeeAdvanceAssignments = await EmployeeAdvanceAssignment.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
 .limit(parseInt(limit));
 res.status(200).json({
   status: constants.APIResponseStatus.Success,
   data: employeeAdvanceAssignments,
   total: totalCount
 });
});
