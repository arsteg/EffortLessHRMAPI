
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
const websocketHandler = require('../utils/websocketHandler');
const { SendUINotification } = require('../utils/uiNotificationSender');
const EmailTemplate = require('../models/commons/emailTemplateModel');
const Company = require('../models/companyModel');
const sendEmail = require('../utils/email');

// Email helper function for Expense Reports
const sendExpenseEmailToUsers = async (user, recipient, email_template_constant, expenseReport, company, expenseUrl = null) => {
  console.log('sendExpenseEmailToUsers called with:', { user, recipient, email_template_constant, expenseReport, company, expenseUrl });
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(email_template_constant).where('company').equals(company._id);

  if (emailTemplate) {
    const template = emailTemplate.contentData;

    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

    const expenseLink = expenseUrl || '#';
    const submissionDate = expenseReport.createdAt ? formatDate(expenseReport.createdAt) : formatDate(new Date());

    const message = template
      .replace("{firstName}", recipient.firstName)
      .replace("{lastName}", recipient.lastName)
      .replace("{employeeName}", user.firstName + " " + user.lastName)
      .replace("{expenseTitle}", expenseReport.title || "Expense Report")
      .replace("{expenseAmount}", expenseReport.amount || "0")
      .replace("{submissionDate}", submissionDate)
      .replace("{status}", expenseReport.status || "")
      .replace("{reason}", expenseReport.reason || "-")
      .replace("{expenseUrl}", expenseLink)
      .replace("{company}", company.companyName);

    try {
      await sendEmail({
        email: recipient.email,
        subject: emailTemplate.subject,
        message
      });
    } catch (err) {
      console.error(`Error sending expense email to ${recipient.email}:`, err);
    }
  }
};

// Email helper function for Advance Reports
const sendAdvanceEmailToUsers = async (user, recipient, email_template_constant, advance, company, category = null, advanceUrl = null) => {
  console.log('sendAdvanceEmailToUsers called with:', { user, recipient, email_template_constant, advance, company, category, advanceUrl });
  const emailTemplate = await EmailTemplate.findOne({}).where('Name').equals(email_template_constant).where('company').equals(company._id);

  if (emailTemplate) {
    const template = emailTemplate.contentData;

    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

    const advanceLink = advanceUrl || '#';
    const submissionDate = advance.createdAt ? formatDate(advance.createdAt) : formatDate(new Date());
    const categoryLabel = category?.label || advance.category?.label || "Advance";

    const message = template
      .replace("{firstName}", recipient.firstName)
      .replace("{lastName}", recipient.lastName)
      .replace("{employeeName}", user.firstName + " " + user.lastName)
      .replace("{category}", categoryLabel)
      .replace("{advanceAmount}", advance.amount || "0")
      .replace("{submissionDate}", submissionDate)
      .replace("{status}", advance.status || "")
      .replace("{comment}", advance.comment || "-")
      .replace("{reason}", advance.reason || "-")
      .replace("{advanceUrl}", advanceLink)
      .replace("{company}", company.companyName);

    try {
      await sendEmail({
        email: recipient.email,
        subject: emailTemplate.subject,
        message
      });
    } catch (err) {
      console.error(`Error sending advance email to ${recipient.email}:`, err);
    }
  }
};

exports.createExpenseCategory = catchAsync(async (req, res, next) => {
  const { type, label, isMandatory } = req.body;
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('expense.companyInfoMissing'),
    });
  }
  else {
    const expenseCategoryExists = await ExpenseCategory.findOne({ label: label, company: company });
    if (expenseCategoryExists) {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('expense.labelInUse'),
      });
    }
    else {
      const expenseCategory = await ExpenseCategory.create({ type, label, isMandatory, company });

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
      status: constants.APIResponseStatus.Error,
      message: req.t('expense.internalServerError')
    });
  }
});

exports.updateExpenseCategory = catchAsync(async (req, res, next) => {
  const expenseCategoryExists = await ExpenseCategory.findOne({ label: req.body.label, _id: { $ne: req.params.id } });
  if (expenseCategoryExists) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('expense.labelInUse'),
    });
  }
  else {
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
      message: req.t('expense.categoryInUse'),
    });
  }
  const expenseCategoryInstance = await ExpenseCategory.findById(req.params.id);
  await expenseCategoryInstance.remove();
  if (!expenseCategoryInstance) {
    return next(new AppError(req.t('expense.categoryNotFound'), 404));
  }

  return res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllExpenseCategories = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip);
  const limit = parseInt(req.body.next);
  // Extract companyId from req.cookies
  const company = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!company) {
    return next(new AppError(req.t('expense.companyIdNotFound'), 400)
    );
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
      eerror: req.t('expense.invalidRequestData'),
    });
  }
  // Prepare an array to store the created fields
  const createdFields = [];
  // Iterate through the fields array and create ExpenseApplicationField records
  for (const field of fields) {
    const { fieldName, fieldType, expenseApplicationFieldValues } = field;
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
    return next(new AppError(req.t('expense.invalidRequestData'), 400)
    );
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
            throw new AppError(req.t('expense.applicationFieldNotFound', { id }), 404)
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
      message: req.t('expense.applicationFieldUpdated'),
    });
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    } else {
      return next(new AppError(req.t('expense.internalServerError'), 500));
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
    return next(new AppError(req.t('expense.applicationFieldNotFound', { id: req.params.id }), 404)

    );
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getExpenseApplicationFieldsByCategory = catchAsync(async (req, res, next) => {
  const expenseApplicationFields = await ExpenseApplicationField.find({})
    .where('expenseCategory').equals(req.params.expenseCategoryId);

  if (expenseApplicationFields) {
    for (var i = 0; i < expenseApplicationFields.length; i++) {
      const expenseApplicationFieldValues = await ExpenseApplicationFieldValue.find({})
        .where('expenseApplicationField').equals(expenseApplicationFields[i]._id);

      if (expenseApplicationFieldValues && expenseApplicationFieldValues.length) {
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
  const { expenseApplicationField, expenseApplicationFieldValues } = req.body;
  // Validate the incoming data
  if (!expenseApplicationField || !Array.isArray(expenseApplicationFieldValues) || expenseApplicationFieldValues.length === 0) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      error: req.t('expense.invalidRequestData'),
    });
  }
  // Prepare an array to store the created fields
  const createdFields = [];
  // Iterate through the fields array and create ExpenseApplicationField records
  for (const field of expenseApplicationFieldValues) {
    const { value } = field;
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
      return next(new AppError(req.t('expense.fieldValueNotFound', { id }), 404));
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
    return next(new AppError(req.t('expense.fieldValueNotFound', { id: req.params.id }), 404));
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
  const company = req.cookies.companyId;
  // Check if policyLabel is provided
  if (!expenseTemplateData.policyLabel) {
    return next(new AppError(req.t('expense.policyLabelRequired'), 400));
  }

  // Check if policyLabel already exists
  const existingTemplate = await ExpenseTemplate.findOne({ 'policyLabel': expenseTemplateData.policyLabel, company: company });

  if (existingTemplate) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('expense.policyLabelExists'),
    });
  }
  if (!Array.isArray(expenseCategories) || expenseCategories.length === 0) {
    return next(new AppError(req.t('expense.categoryNotInRequest'), 400)
    );
  }
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError(req.t('expense.companyIdNotFound'), 400)
    );
  }
  for (const category of expenseCategories) {
    const result = await ExpenseCategory.findById(category.expenseCategory);
    if (!result) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('expense.invalidCategory'),
      });
    }
  }
  // Add companyId to the request body
  expenseTemplateData.company = companyId;
  const expenseTemplate = await ExpenseTemplate.create(expenseTemplateData);

  const expenseTemplateCategories = await updateOrCreateExpenseTemplateCategories(expenseTemplate._id, expenseCategories);

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
    throw new AppError(req.t('expense.internalServerError'), 500);
  }
}

exports.getExpenseTemplate = catchAsync(async (req, res, next) => {
  const expenseTemplate = await ExpenseTemplate.findById(req.params.id);
  const expenseTemplateApplicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(req.params.id);
  expenseTemplate.applicableCategories = expenseTemplateApplicableCategories;
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseTemplate
  });
});

exports.updateExpenseTemplate = catchAsync(async (req, res, next) => {
  const { expenseCategories, ...expenseTemplateData } = req.body;

  // Check if policyLabel is provided
  if (!expenseTemplateData.policyLabel) {
    return next(new AppError(req.t('expense.policyLabelRequired'), 400)
    );
  }

  // Check if policyLabel already exists
  const existingTemplate = await ExpenseTemplate.findOne({ 'policyLabel': expenseTemplateData.policyLabel, _id: { $ne: req.params.id } });

  if (existingTemplate) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('expense.policyLabelExists'),
    });
  }
  if (!Array.isArray(expenseCategories) || expenseCategories.length === 0) {
    return next(new AppError(req.t('expense.categoryNotInRequest'), 400)
    );
  }
  const expenseTemplate = await ExpenseTemplate.findByIdAndUpdate(req.params.id, expenseTemplateData, {
    new: true,
    runValidators: true
  });

  if (!expenseTemplate) {
    return next(new AppError(req.t('expense.templateNotFound'), 404)
    );
  }

  const updatedCategories = await updateOrCreateExpenseTemplateCategories(req.params.id, req.body.expenseCategories);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: { expenseTemplate: expenseTemplate, expenseCategories: updatedCategories },
  });
});


exports.deleteExpenseTemplate = catchAsync(async (req, res, next) => {
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.find({}).where('expenseTemplate').equals(req.params.id);
  if (employeeExpenseAssignment.length > 0) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      data: null,
      message: req.t('expense.templateInUse')
    });
  }

  const expenseTemplate = await ExpenseTemplate.findByIdAndDelete(req.params.id);

  if (!expenseTemplate) {
    return next(new AppError(req.t('expense.templateNotFound'), 404));
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllExpenseTemplates = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next);

  const query = { company: req.cookies.companyId };
  // Get the total count of documents matching the query
  const totalCount = await ExpenseTemplate.countDocuments(query);
  const expenseTemplates = await ExpenseTemplate.find(query).skip(parseInt(skip))
    .limit(parseInt(limit));

  if (expenseTemplates) {
    for (var i = 0; i < expenseTemplates.length; i++) {
      const expenseTemplateApplicableCategories = await ExpenseTemplateApplicableCategories.find({}).where('expenseTemplate').equals(expenseTemplates[i]._id);
      if (expenseTemplateApplicableCategories) {
        expenseTemplates[i].applicableCategories = expenseTemplateApplicableCategories;
      }
      else {
        expenseTemplates[i].applicableCategories = null;
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
    return next(new AppError(req.t('expense.invalidRequestData'), 400));
  }
  for (const category of expenseCategories) {
    const result = await ExpenseCategory.findById(category.expenseCategory);
    if (!result) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('expense.invalidCategory'),
      });
    }
  }
  // Iterate through expenseCategories to create or update records
  const expenseTemplateCategories = await createExpenseTemplateCategories(mongoose.Types.ObjectId(expenseTemplate), expenseCategories);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: expenseTemplateCategories
  });

});

exports.getAllExpenseTemplateApplicableCategories = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId;
  const applicableCategories = await ExpenseTemplateApplicableCategories.find({ company: companyId });
  if (applicableCategories) {

    for (var i = 0; i < applicableCategories.length; i++) {

      const expenseTemplateCategoryFieldValues = await ExpenseTemplateCategoryFieldValues.find({}).where('expenseTemplateCategory').equals(applicableCategories[i]._id);
      if (expenseTemplateCategoryFieldValues) {
        applicableCategories[i].expenseTemplateCategoryFieldValues = expenseTemplateCategoryFieldValues;
      }
      else {
        applicableCategories[i].expenseTemplateCategoryFieldValues = null;
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
  if (applicableCategories) {

    for (var i = 0; i < applicableCategories.length; i++) {
      const expenseTemplateCategoryFieldValues = await ExpenseTemplateCategoryFieldValues.find({}).where('expenseTemplateCategory').equals(applicableCategories[i]._id);
      if (expenseTemplateCategoryFieldValues) {
        applicableCategories[i].expenseTemplateCategoryFieldValues = expenseTemplateCategoryFieldValues;
      }
      else {
        applicableCategories[i].expenseTemplateCategoryFieldValues = null;
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

  if (applicableCategories) {
    const expenseTemplateCategoryFieldValues = await ExpenseTemplateCategoryFieldValues.find({}).where('expenseTemplateCategory').equals(applicableCategories._id);
    if (expenseTemplateCategoryFieldValues) {
      applicableCategories.expenseTemplateCategoryFieldValues = expenseTemplateCategoryFieldValues;
    }
    else {
      applicableCategories.expenseTemplateCategoryFieldValues = null;
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
    return next(new AppError(req.t('expense.companyIdNotFound'), 400)
    );
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const employeeExpenseAssignmentExists = await EmployeeExpenseAssignment.find({}).where('user').equals(req.body.user);
  var employeeExpenseAssignment;
  const expenseTemplate = await ExpenseTemplate.findById(req.body.expenseTemplate);
  if (expenseTemplate && expenseTemplate.approvalType == "template-wise") {
    req.body.primaryApprover = expenseTemplate.firstApprovalEmployee;
    req.body.secondaryApprover = expenseTemplate.secondApprovalEmployee;
  }
  if (employeeExpenseAssignmentExists.length <= 0) {

    employeeExpenseAssignment = await EmployeeExpenseAssignment.create(req.body);
  }
  else {
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
    return next(new AppError(req.t('expense.employeeAssignmentNotFound'), 404)
    );
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
  const employeeExpenseAssignment = await EmployeeExpenseAssignment.findOne({ user: req.params.userId });
  var expenseTemplate = [];
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

  const expenseReport = await ExpenseReport.find({}).where('employee').equals(req.body.user).where('status').nin(['Approved', 'Rejected', 'Cancelled']); // Filter by status
  ;
  if (expenseReport.length > 0) {
    return next(new AppError(req.t('expense.expensesNeedClosure'), 404));
  }
  const expenseTemplate = await ExpenseTemplate.findById(req.body.expenseTemplate);
  if (expenseTemplate && expenseTemplate.approvalType == "template-wise") {
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
    return next(new AppError(req.t('expense.employeeAssignmentNotFound'), 404));
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
    return next(new AppError(req.t('expense.employeeAssignmentNotFound'), 404)

    );
  }
  const expenseReport = await ExpenseReport.find({}).where('employee').equals(userExpenseAssignment.user).where('status').nin(['Approved', 'Rejected', 'Cancelled']); // Filter by status
  ;
  if (expenseReport.length > 0) {
    return next(new AppError(req.t('expense.expensesNeedClosure'), 404)

    );
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
  const { employee, title, status, amount, expenseReportExpenses } = req.body;
  try {
    // Validate that report amount matches sum of line items (when applicable)
    if (expenseReportExpenses && expenseReportExpenses.length > 0 && amount !== undefined) {
      const calculatedSum = expenseReportExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);

      // Check if template allows manual amount with items
      const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({ user: employee })
        .populate('expenseTemplate');

      if (userExpenseAssignment && userExpenseAssignment.expenseTemplate) {
        const template = userExpenseAssignment.expenseTemplate;

        // If advanceAmount is false, report amount must equal sum of line items
        if (!template.advanceAmount && Math.abs(amount - calculatedSum) > 0.01) {
          return res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            message: req.t(`Report amount (${amount}) must equal the sum of line items (${calculatedSum.toFixed(2)}).`)
          });
        }
      }
    }

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
        const { expenseCategory, incurredDate, expenseTemplateCategoryFieldValues, type, quantity, amount, isReimbursable, isBillable, reason, expenseAttachments, expenseReportExpenseFields } = expenseData;
        if (expenseAttachments != null) {
          for (var i = 0; i < expenseAttachments.length; i++) {
            if (!expenseAttachments[i].attachmentType || !expenseAttachments[i].attachmentName || !expenseAttachments[i].attachmentSize || !expenseAttachments[i].extention || !expenseAttachments[i].file
              || expenseAttachments[i].attachmentType === null || expenseAttachments[i].attachmentName === null || expenseAttachments[i].attachmentSize === null || expenseAttachments[i].extention === null || expenseAttachments[i].file === null) {
              return res.status(400).json({ error: req.t('expense.attachmentPropertiesMissing') });
            }
            const id = Date.now().toString(36);
            expenseAttachments[i].filePath = expenseAttachments[i].attachmentName + "_" + id + expenseAttachments[i].extention;
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
          documentLink,
          documentName
        });
        // Create ExpenseReportExpenseFields for each expense
        if (expenseReportExpenseFields && expenseReportExpenseFields.length > 0) {
          expense.expenseReportExpenseFields = await ExpenseReportExpenseFields.insertMany(
            expenseReportExpenseFields.map((field) => ({
              expenseReportExpense: expense._id,
              expenseApplicationField: field.expenseApplicationField,
              type: field.type,
              value: field.value,
              fromDate: field.fromDate,
              toDate: field.toDate
            }))
          );
        }
        return expense;
      })
    );

    // Fetch user, company, and expense assignment details
    const user = await User.findById(expenseReport.employee);
    const companyDetails = await Company.findById(req.cookies.companyId);
    const expenseAssignment = await EmployeeExpenseAssignment.findOne({ user: user._id }).populate('expenseTemplate');

    // Generate navigation URLs
    const employeeExpenseUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/my-expense`;
    const managerApprovalUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/expense-reports`;

    // Send confirmation notification to employee
    SendUINotification(
      req.t('expense.expenseSubmissionNotificationTitle'),
      req.t('expense.expenseSubmissionNotificationMessage', { firstName: user?.firstName, lastName: user?.lastName, expenseTitle: expenseReport.title }),
      constants.Event_Notification_Type_Status.Expense,
      user?._id?.toString(),
      req.cookies.companyId,
      req,
      employeeExpenseUrl
    );

    // Send confirmation email to employee
    await sendExpenseEmailToUsers(
      user,
      user,
      constants.Email_template_constant.Expense_Report_Submission_Request,
      expenseReport,
      companyDetails,
      employeeExpenseUrl
    );

    // Get primary approver and send approval request
    if (expenseAssignment) {
      const primaryApproverId = expenseAssignment.primaryApprover;
      if (primaryApproverId) {
        const primaryApprover = await User.findById(primaryApproverId);
        if (primaryApprover) {
          // Send UI notification to primary approver
          SendUINotification(
            req.t('expense.expenseApprovalRequestNotificationTitle'),
            req.t('expense.expenseApprovalRequestNotificationMessage', { firstName: primaryApprover?.firstName, lastName: primaryApprover?.lastName, employeeName: `${user.firstName} ${user.lastName}` }),
            constants.Event_Notification_Type_Status.Expense,
            primaryApprover?._id?.toString(),
            req.cookies.companyId,
            req,
            managerApprovalUrl
          );

          // Send email to primary approver
          await sendExpenseEmailToUsers(
            user,
            primaryApprover,
            constants.Email_template_constant.Expense_Report_Approval_Request,
            expenseReport,
            companyDetails,
            managerApprovalUrl
          );
        }
      }
    }

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        expenseReport
      },
      message: req.t('expense.reportCreated'),

    });
  } catch (error) {
    console.error(error);
    next(new AppError(req.t('expense.internalServerError'), 500)
    );
  }
});

exports.getExpenseReport = catchAsync(async (req, res, next) => {
  const expenseReport = await ExpenseReport.findById(req.params.id);
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.id);
  if (expenseReportExpenses) {
    for (var i = 0; i < expenseReportExpenses.length; i++) {
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);
      if (expenseReportExpenseFields) {
        expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
      }
      else {
        expenseReportExpenses[i].expenseReportExpenseFields = null;
      }
    }
    expenseReport.expenseReportExpense = expenseReportExpenses;
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReport,
  });
});

exports.updateExpenseReport = catchAsync(async (req, res, next) => {
  if (req.body.status === 'Approved' || req.body.status === 'Rejected' || req.body.status === 'Cancelled') {
    const expenseTemplate = await EmployeeExpenseAssignment.findOne({ user: req.body.employee });
    const expenseReport = await ExpenseReport.findById(mongoose.Types.ObjectId(req.params.id));

    if (expenseTemplate && expenseTemplate.primaryApprover) {
      if (expenseReport.status === constants.Leave_Application_Constant.Level_1_Approval_Pending && expenseTemplate.primaryApprover.toString() !== req.cookies.userId) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('Only the designated approver can approve or reject this expense.')
        });
      }
      // else {
      //   req.body.status = req.body.status === 'Approved' ? constants.Leave_Application_Constant.Level_2_Approval_Pending : req.body.status;
      // }
      // if(expenseReport.status === constants.Leave_Application_Constant.Level_2_Approval_Pending && expenseTemplate.secondaryApprover.toString() !== req.cookies.userId) {
      //   return res.status(400).json({
      //     status: constants.APIResponseStatus.Failure,
      //     message: req.t('Only the designated approver can approve or reject this expense.')
      //   });
      // }
    }
  }

  // Validate that report amount matches sum of line items (when applicable)
  const expenseReportId = req.params.id;
  const lineItems = await ExpenseReportExpense.find({ expenseReport: expenseReportId });

  if (lineItems && lineItems.length > 0 && req.body.amount !== undefined) {
    const calculatedSum = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const reportAmount = req.body.amount;

    // Check if template allows manual amount with items
    const report = await ExpenseReport.findById(expenseReportId);
    const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({ user: report.employee })
      .populate('expenseTemplate');

    if (userExpenseAssignment && userExpenseAssignment.expenseTemplate) {
      const template = userExpenseAssignment.expenseTemplate;

      // If advanceAmount is false, report amount must equal sum of line items
      if (!template.advanceAmount && Math.abs(reportAmount - calculatedSum) > 0.01) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t(`Report amount (${reportAmount}) must equal the sum of line items (${calculatedSum.toFixed(2)}).`)
        });
      }
    }
  }

  const expenseReport = await ExpenseReport.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!expenseReport) {
    return next(new AppError(req.t('expense.reportNotFound'), 404)
    );
  }
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.id);
  if (expenseReportExpenses) {
    for (var i = 0; i < expenseReportExpenses.length; i++) {
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);
      if (expenseReportExpenseFields) {
        expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
      }
      else {
        expenseReportExpenses[i].expenseReportExpenseFields = null;
      }
    }
    expenseReport.expenseReportExpense = expenseReportExpenses;
  }

  // Fetch user, company, and expense assignment details for notifications
  const user = await User.findById(expenseReport.employee);
  const companyDetails = await Company.findById(req.cookies.companyId);
  const expenseAssignment = await EmployeeExpenseAssignment.findOne({ user: user._id }).populate('expenseTemplate');

  // Generate navigation URLs
  const employeeExpenseUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/my-expense`;
  const managerApprovalUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/team-expense`;

  // Handle notifications based on status changes
  if (req.body.status === 'Approved') {
    // Approval - notify employee
    SendUINotification(
      req.t('expense.expenseApprovedNotificationTitle'),
      req.t('expense.expenseApprovedNotificationMessage', { firstName: user?.firstName, lastName: user?.lastName }),
      constants.Event_Notification_Type_Status.Expense,
      user?._id?.toString(),
      req.cookies.companyId,
      req,
      employeeExpenseUrl
    );

    // Send approval email to employee
    await sendExpenseEmailToUsers(
      user,
      user,
      constants.Email_template_constant.Expense_Report_Approved,
      expenseReport,
      companyDetails,
      employeeExpenseUrl
    );
  } else if (req.body.status === 'Rejected') {
    // Rejection - notify employee
    SendUINotification(
      req.t('expense.expenseRejectedNotificationTitle'),
      req.t('expense.expenseRejectedNotificationMessage', { firstName: user?.firstName, lastName: user?.lastName }),
      constants.Event_Notification_Type_Status.Expense,
      user?._id?.toString(),
      req.cookies.companyId,
      req,
      employeeExpenseUrl
    );

    // Send rejection email to employee
    await sendExpenseEmailToUsers(
      user,
      user,
      constants.Email_template_constant.Expense_Report_Rejected,
      expenseReport,
      companyDetails,
      employeeExpenseUrl
    );
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
      message: req.t('expense.reportInUse')
    });
  }
  const expenseReport = await ExpenseReport.findByIdAndDelete(req.params.id);

  if (!expenseReport) {
    return next(new AppError(req.t('expense.reportNotFound'), 404)

    );
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
  for (var j = 0; j < expenseReports.length; j++) {
    {
      const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(expenseReports[j]._id);
      if (expenseReportExpenses) {
        for (var i = 0; i < expenseReportExpenses.length; i++) {
          const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);
          if (expenseReportExpenseFields) {
            expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
          }
          else {
            expenseReportExpenses[i].expenseReportExpenseFields = null;
          }
        }
      }
      expenseReports[j].expenseReportExpense = expenseReportExpenses;
      const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({ user: expenseReports[j].employee });
      if (userExpenseAssignment) {
        const expenseTemplate = await ExpenseTemplate.findById(userExpenseAssignment.expenseTemplate);
        if (expenseTemplate) {
          const reportObj = expenseReports[j].toObject();
          reportObj.advanceAmountAllowed = expenseTemplate.advanceAmount;
          reportObj.expenseReportExpense = expenseReportExpenses;
          expenseReports[j] = reportObj;
        }
      }
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
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; i++) {
      teamIdsArray.push(ids[i]);
    }
  }
  if (teamIds == null) {
    teamIdsArray.push(req.cookies.userId);
  }

  const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = { employee: { $in: objectIdArray } };
  if (req.body.status === constants.Leave_Application_Constant.Level_1_Approval_Pending || req.body.status === constants.Leave_Application_Constant.Level_2_Approval_Pending) {
    query.status = { $in: [constants.Leave_Application_Constant.Level_1_Approval_Pending, constants.Leave_Application_Constant.Level_2_Approval_Pending] };
  } else {
    query.status = req.body.status;
  }
  const totalCount = await ExpenseReport.countDocuments(query);

  // Get the regularization requests matching the query with pagination
  const expenseReports = await ExpenseReport.find(query)
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  for (var j = 0; j < expenseReports.length; j++) {
    {
      const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(expenseReports[j]._id);
      if (expenseReportExpenses) {
        for (var i = 0; i < expenseReportExpenses.length; i++) {
          const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);
          if (expenseReportExpenseFields) {
            expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
          }
          else {
            expenseReportExpenses[i].expenseReportExpenseFields = null;
          }
        }
      }
      expenseReports[j].expenseReportExpense = expenseReportExpenses;
      const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({ user: expenseReports[j].employee });
      if (userExpenseAssignment) {
        const expenseTemplate = await ExpenseTemplate.findById(userExpenseAssignment.expenseTemplate);
        if (expenseTemplate) {
          const reportObj = expenseReports[j].toObject();
          reportObj.advanceAmountAllowed = expenseTemplate.advanceAmount;
          reportObj.expenseReportExpense = expenseReportExpenses;
          expenseReports[j] = reportObj;
        }
      }
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
  if (req.body.status === constants.Leave_Application_Constant.Level_1_Approval_Pending || req.body.status === constants.Leave_Application_Constant.Level_2_Approval_Pending) {
    query.status = { $in: [constants.Leave_Application_Constant.Level_1_Approval_Pending, constants.Leave_Application_Constant.Level_2_Approval_Pending] };
  } else {
    query.status = req.body.status;
  }
  const totalCount = await ExpenseReport.countDocuments(query);


  const expenseReports = await ExpenseReport.find(query).skip(parseInt(skip))
    .limit(parseInt(limit));
  for (var j = 0; j < expenseReports.length; j++) {
    {
      const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(expenseReports[j]._id);
      if (expenseReportExpenses) {
        for (var i = 0; i < expenseReportExpenses.length; i++) {
          const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);
          if (expenseReportExpenseFields) {
            expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
          }
          else {
            expenseReportExpenses[i].expenseReportExpenseFields = null;
          }
        }
      }
      expenseReports[j].expenseReportExpense = expenseReportExpenses;
      const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({ user: expenseReports[j].employee });
      if (userExpenseAssignment) {
        const expenseTemplate = await ExpenseTemplate.findById(userExpenseAssignment.expenseTemplate);
        if (expenseTemplate) {
          const reportObj = expenseReports[j].toObject();
          reportObj.advanceAmountAllowed = expenseTemplate.advanceAmount;
          reportObj.expenseReportExpense = expenseReportExpenses;
          expenseReports[j] = reportObj;
        }
      }
    }
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReports,
    total: totalCount
  });
});

async function expenseReportValidation(req, res, next) {
  const { expenseReport, expenseCategory, incurredDate, amount, expenseAttachments } = req.body;
  const report = await ExpenseReport.findById(expenseReport);
  const employee = report.employee;
  const userExpenseAssignment = await EmployeeExpenseAssignment.findOne({ user: employee });
  const template = await ExpenseTemplateApplicableCategories.findOne({}).where('expenseCategory').equals(expenseCategory).where('expenseTemplate').equals(userExpenseAssignment.expenseTemplate._id.toString());
  const expenseTemplateDetails = await ExpenseTemplate.findById(userExpenseAssignment.expenseTemplate._id);

  if (template) {
    // Priority 1 Validation: Maximum Amount Per Expense
    if (template.isMaximumAmountPerExpenseSet && amount) {
      if (amount > template.maximumAmountPerExpense) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t("Expense amount exceeds the maximum allowed limit of " + template.maximumAmountPerExpense + ".")
        });
      }
    }

    // Priority 1 Validation: Maximum Amount Without Receipt
    if (template.isMaximumAmountWithoutReceiptSet && amount) {
      if (amount > template.maximumAmountWithoutReceipt) {
        // Check if receipt/attachment is provided
        if (!expenseAttachments || expenseAttachments.length === 0) {
          return res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            message: req.t("Receipt is required for expenses exceeding " + template.maximumAmountWithoutReceipt + ".")
          });
        }
      }
    }

    // Priority 1 Validation: Duplicate Category-Date Prevention
    if (expenseTemplateDetails && expenseTemplateDetails.applyforSameCategorySamedate === false) {
      const startOfDay = new Date(incurredDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(incurredDate);
      endOfDay.setHours(23, 59, 59, 999);

      const duplicateCount = await ExpenseReportExpense.countDocuments({
        employee: employee,
        expenseCategory: expenseCategory,
        incurredDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (duplicateCount > 0) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t("You cannot submit multiple expenses for the same category on the same date.")
        });
      }
    }

    if (template.timePeroid && template.maximumExpensesCanApply) {
      const timePeriod = template.timePeroid === 'Day' ? 1 : template.timePeroid === 'Week' ? 7 : template.timePeroid === 'Month' ? 30 : 1;
      const timePeriodDate = new Date(incurredDate);
      timePeriodDate.setDate(timePeriodDate.getDate() + timePeriod);

      const count = await ExpenseReportExpense.countDocuments({
        employee: employee,
        expenseCategory: expenseCategory,
        incurredDate: { $gte: incurredDate, $lt: timePeriodDate },
      });

      if (count >= template.maximumExpensesCanApply) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t("You've reached the maximum allowed submissions for this period.")
        });
      }
    }

    if (template.expiryDay) {
      const expiryDate = new Date(incurredDate);
      expiryDate.setDate(expiryDate.getDate() + template.expiryDay);

      if (new Date() > expiryDate) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t("This expense report has expired.")
        });
      }
    }
  }
};

exports.createExpenseReportExpense = catchAsync(async (req, res, next) => {

  await expenseReportValidation(req, res, next);

  // Create ExpenseReportExpense
  const expenseAttachments = req.body.expenseAttachments;
  var documentLink;
  for (var i = 0; i < expenseAttachments.length; i++) {
    if (!expenseAttachments[i].attachmentType || !expenseAttachments[i].attachmentName || !expenseAttachments[i].attachmentSize || !expenseAttachments[i].extention || !expenseAttachments[i].file
      || expenseAttachments[i].attachmentType === null || expenseAttachments[i].attachmentName === null || expenseAttachments[i].attachmentSize === null || expenseAttachments[i].extention === null || expenseAttachments[i].file === null) {
      return res.status(400).json({ error: req.t('expense.attachmentPropertiesMissing') });

    }
    const id = Date.now().toString(36);
    expenseAttachments[i].filePath = expenseAttachments[i].attachmentName + "_" + id + expenseAttachments[i].extention;
    //req.body.attachment.file = req.body.taskAttachments[i].file;
    var documentName = expenseAttachments[i].attachmentName;

    var documentLink = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.ExpenseAttachment, expenseAttachments[i]);

    req.body.documentLink = documentLink;
    req.body.documentName = documentName
  }
  const expenseReportExpense = await ExpenseReportExpense.create(req.body);

  // Create ExpenseReportExpenseFields if provided
  if (req.body.expenseReportExpenseFields && req.body.expenseReportExpenseFields.length > 0) {
    const expenseReportExpenseFields = req.body.expenseReportExpenseFields.map((field) => ({
      expenseReportExpense: expenseReportExpense._id,
      expenseApplicationField: field.expenseApplicationField,
      type: field.type,
      value: field.value,
      fromDate: field.fromDate,
      toDate: field.toDate
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
  if (expenseReportExpense) {
    const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpense._id);
    if (expenseReportExpenseFields) {
      expenseReportExpense.expenseReportExpenseFields = expenseReportExpenseFields;
    }
    else {
      expenseReportExpense.expenseReportExpenseFields = null;
    }

  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: expenseReportExpense
  });
});

exports.updateExpenseReportExpense = catchAsync(async (req, res, next) => {
  await expenseReportValidation(req, res, next);

  const { id } = req.params;
  const expenseAttachments = req.body.expenseAttachments;

  var documentLink;
  for (var i = 0; i < expenseAttachments.length; i++) {
    if (!expenseAttachments[i].attachmentType || !expenseAttachments[i].attachmentName || !expenseAttachments[i].attachmentSize || !expenseAttachments[i].extention || !expenseAttachments[i].file
      || expenseAttachments[i].attachmentType === null || expenseAttachments[i].attachmentName === null || expenseAttachments[i].attachmentSize === null || expenseAttachments[i].extention === null || expenseAttachments[i].file === null) {
      return res.status(400).json({ error: req.t('expense.attachmentPropertiesMissing') });
    }
    const id = Date.now().toString(36);
    expenseAttachments[i].filePath = expenseAttachments[i].attachmentName + "_" + id + expenseAttachments[i].extention;
    //req.body.attachment.file = req.body.taskAttachments[i].file;
    var documentLink = await StorageController.createContainerInContainer(req.cookies.companyId, constants.SubContainers.ExpenseAttachment, expenseAttachments[i]);
    var documentName = expenseAttachments[i].attachmentName;
    req.body.documentName = documentName
    req.body.documentLink = documentLink;
  }
  // Update ExpenseReportExpense
  const updatedExpenseReportExpense = await ExpenseReportExpense.findByIdAndUpdate(id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Run Mongoose validators
  });

  if (!updatedExpenseReportExpense) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('expense.reportExpenseNotFound'),

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
            fromDate: field.fromDate,
            toDate: field.toDate
          });
        } else {
          // If ID is not present, create new ExpenseReportExpenseFields
          return ExpenseReportExpenseFields.create({
            expenseReportExpense: id,
            expenseApplicationField: field.expenseApplicationField,
            type: field.type,
            value: field.value,
            fromDate: field.fromDate,
            toDate: field.toDate
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
    new AppError(req.t('expense.reportExpenseNotFound'), 404);
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllExpenseReportExpensesByExpenseReport = catchAsync(async (req, res, next) => {
  const expenseReportExpenses = await ExpenseReportExpense.find({}).where('expenseReport').equals(req.params.expenseReportId);
  if (expenseReportExpenses) {
    for (var i = 0; i < expenseReportExpenses.length; i++) {
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);
      if (expenseReportExpenseFields) {
        expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
      }
      else {
        expenseReportExpenses[i].expenseReportExpenseFields = null;
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
  if (expenseReportExpenses) {
    for (var i = 0; i < expenseReportExpenses.length; i++) {
      const expenseReportExpenseFields = await ExpenseReportExpenseFields.find({}).where('expenseReportExpense').equals(expenseReportExpenses[i]._id);
      if (expenseReportExpenseFields) {
        expenseReportExpenses[i].expenseReportExpenseFields = expenseReportExpenseFields;
      }
      else {
        expenseReportExpenses[i].expenseReportExpenseFields = null;
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
    return next(new AppError(req.t('expense.companyIdNotFound'), 400)
    );
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const { employee, category, amount, comment } = req.body;


  // Create Advance with status "Level 1 Approval Pending"
  const advance = await Advance.create({
    employee,
    category,
    amount,
    comment,
    company: req.cookies.companyId,
    status: 'Level 1 Approval Pending'
  });

  // Fetch user, company, category, and advance assignment details
  const user = await User.findById(advance.employee);
  const companyDetails = await Company.findById(req.cookies.companyId);
  const categoryDetails = await AdvanceCategory.findById(advance.category);
  const advanceAssignment = await EmployeeAdvanceAssignment.findOne({ user: user._id }).populate('advanceTemplate');

  // Generate navigation URLs
  const employeeAdvanceUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/advance-reports`;
  const managerApprovalUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/advance-reports`;

  // Send confirmation notification to employee
  SendUINotification(
    req.t('expense.advanceSubmissionNotificationTitle'),
    req.t('expense.advanceSubmissionNotificationMessage', { firstName: user?.firstName, lastName: user?.lastName, category: categoryDetails?.label }),
    constants.Event_Notification_Type_Status.Expense,
    user?._id?.toString(),
    req.cookies.companyId,
    req,
    employeeAdvanceUrl
  );

  // Send confirmation email to employee
  await sendAdvanceEmailToUsers(
    user,
    user,
    constants.Email_template_constant.Advance_Submission_Request,
    advance,
    companyDetails,
    categoryDetails,
    employeeAdvanceUrl
  );

  // Get primary approver and send approval request
  if (advanceAssignment) {
    const primaryApproverId = advanceAssignment.primaryApprover;
    if (primaryApproverId) {
      const primaryApprover = await User.findById(primaryApproverId);
      if (primaryApprover) {
        // Send UI notification to primary approver
        SendUINotification(
          req.t('expense.advanceApprovalRequestNotificationTitle'),
          req.t('expense.advanceApprovalRequestNotificationMessage', { firstName: primaryApprover?.firstName, lastName: primaryApprover?.lastName, employeeName: `${user.firstName} ${user.lastName}` }),
          constants.Event_Notification_Type_Status.Expense,
          primaryApprover?._id?.toString(),
          req.cookies.companyId,
          req,
          managerApprovalUrl
        );

        // Send email to primary approver
        await sendAdvanceEmailToUsers(
          user,
          primaryApprover,
          constants.Email_template_constant.Advance_Approval_Request,
          advance,
          companyDetails,
          categoryDetails,
          managerApprovalUrl
        );
      }
    }
  }

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
      status: constants.APIResponseStatus.Error,
      message: req.t('expense.internalServerError')
    });
  }
});

exports.updateAdvance = catchAsync(async (req, res, next) => {
  if (req.body.status === 'Approved' || req.body.status === 'Rejected' || req.body.status === 'Cancelled') {
    const advanceTemplate = await EmployeeAdvanceAssignment.findOne({ user: req.body.employee });
    const advanceReport = await ExpenseAdvance.findById(mongoose.Types.ObjectId(req.params.id));
    if (advanceTemplate && advanceTemplate.primaryApprover && advanceTemplate.secondaryApprover) {
      if (advanceReport.status === constants.Leave_Application_Constant.Level_1_Approval_Pending && advanceTemplate.primaryApprover.toString() !== req.cookies.userId) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('Only the designated approver can approve or reject this expense.')
        });
      } else {
        req.body.status = req.body.status === 'Approved' ? constants.Leave_Application_Constant.Level_2_Approval_Pending : req.body.status;
      }
      if (advanceReport.status === constants.Leave_Application_Constant.Level_2_Approval_Pending && advanceTemplate.secondaryApprover.toString() !== req.cookies.userId) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('Only the designated approver can approve or reject this expense.')
        });
      }
    }
  }
  const advance = await Advance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Fetch user, company, category, and advance assignment details for notifications
  const user = await User.findById(advance.employee);
  const companyDetails = await Company.findById(req.cookies.companyId);
  const categoryDetails = await AdvanceCategory.findById(advance.category);
  const advanceAssignment = await EmployeeAdvanceAssignment.findOne({ user: user._id }).populate('advanceTemplate');

  // Generate navigation URLs
  const employeeAdvanceUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/advance-reports`;
  const managerApprovalUrl = `${process.env.WEBSITE_DOMAIN}/#/home/expense/advance-reports`;

  // Handle notifications based on status changes
  if (req.body.status === 'Approved') {
    // Final approval - notify employee
    SendUINotification(
      req.t('expense.advanceApprovedNotificationTitle'),
      req.t('expense.advanceApprovedNotificationMessage', { firstName: user?.firstName, lastName: user?.lastName }),
      constants.Event_Notification_Type_Status.Expense,
      user?._id?.toString(),
      req.cookies.companyId,
      req,
      employeeAdvanceUrl
    );

    // Send approval email to employee
    await sendAdvanceEmailToUsers(
      user,
      user,
      constants.Email_template_constant.Advance_Approved,
      advance,
      companyDetails,
      categoryDetails,
      employeeAdvanceUrl
    );
  } else if (req.body.status === 'Rejected') {
    // Rejection - notify employee
    SendUINotification(
      req.t('advance.advanceRejectedNotificationTitle'),
      req.t('advance.advanceRejectedNotificationMessage', { firstName: user?.firstName, lastName: user?.lastName }),
      constants.Event_Notification_Type_Status.Expense,
      user?._id?.toString(),
      req.cookies.companyId,
      req,
      employeeAdvanceUrl
    );

    // Send rejection email to employee
    await sendAdvanceEmailToUsers(
      user,
      user,
      constants.Email_template_constant.Advance_Rejected,
      advance,
      companyDetails,
      categoryDetails,
      employeeAdvanceUrl
    );
  }

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

  if (req.body.status === constants.Leave_Application_Constant.Level_1_Approval_Pending || req.body.status === constants.Leave_Application_Constant.Level_2_Approval_Pending) {
    query.status = { $in: [constants.Leave_Application_Constant.Level_1_Approval_Pending, constants.Leave_Application_Constant.Level_2_Approval_Pending] };
  } else {
    query.status = req.body.status;
  }
  const totalCount = await Advance.countDocuments(query);
  const advances = await Advance.find(query).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
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
        message: req.t('expense.advanceNotFound')
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
      message: req.t('expense.internalServerError')
    });
  }
});
exports.createAdvanceCategory = catchAsync(async (req, res, next) => {
  const { label } = req.body;
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('expense.companyInfoMissing'),
    });
  }
  else {
    const advanceCategoryExists = await AdvanceCategory.findOne({ label: label, company: company });
    if (advanceCategoryExists) {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('expense.labelInUse'),
      });
    }
    else {
      const advanceCategory = await AdvanceCategory.create({ label, company });

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
  const advanceCategoryExists = await AdvanceCategory.findOne({ label: req.body.label, _id: { $ne: req.params.id } });
  if (advanceCategoryExists) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('expense.labelInUse')
    });
  }
  else {
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
    return next(new AppError(req.t('expense.categoryNotFound'), 404));
  }

  return res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});

exports.getAllAdvanceCategories = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip);
  const limit = parseInt(req.body.next);
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
      message: req.t('expense.companyInfoMissing'),
    });
  }
  if (!Array.isArray(advanceCategories) || advanceCategories.length === 0) {
    return next(new AppError(req.t('expense.advanceCategoryNotInRequest'), 400)

    );
  }
  else {
    const advanceCategoryExists = await AdvanceTemplate.findOne({ policyLabel: policyLabel, company: company });
    if (advanceCategoryExists) {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('expense.labelInUse')
      });
    }
    else {
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
              message: req.t('expense.invalidCategory')
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
  if (advanceTemplate) {
    const advanceTemplateCategories = await AdvanceTemplateCategory.find({})
      .where('advanceTemplate').equals(advanceTemplate._id);
    if (advanceTemplateCategories && advanceTemplateCategories.length) {
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
    const company = req.cookies.companyId;

    // Validate if company value exists in cookies
    if (!company) {
      return res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('expense.companyInfoMissing'),
      });
    }

    // Find the AdvanceTemplate by ID
    const advanceTemplate = await AdvanceTemplate.findById(id);

    if (!advanceTemplate) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('expense.advanceTemplateNotFound')
      });
    }

    const {
      policyLabel,
      approvalLevel,
      firstApprovalEmployee,
      secondApprovalEmployee,
      approvalType,
      advanceCategories,
    } = req.body;

    // Duplicacy check for policyLabel during update
    if (policyLabel && policyLabel !== advanceTemplate.policyLabel) {
      const existingTemplate = await AdvanceTemplate.findOne({
        policyLabel: policyLabel,
        company: company
      });
      if (existingTemplate) {
        return res.status(409).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('expense.labelInUse')
        });
      }
    }

    // Update AdvanceTemplate fields
    advanceTemplate.policyLabel = policyLabel || advanceTemplate.policyLabel;
    advanceTemplate.approvalLevel = approvalLevel || advanceTemplate.approvalLevel;
    advanceTemplate.firstApprovalEmployee = firstApprovalEmployee || advanceTemplate.firstApprovalEmployee;
    advanceTemplate.secondApprovalEmployee = secondApprovalEmployee || advanceTemplate.secondApprovalEmployee;
    advanceTemplate.approvalType = approvalType || advanceTemplate.approvalType;

    // Save the updated AdvanceTemplate
    await advanceTemplate.save();

    if (!Array.isArray(advanceCategories) || advanceCategories.length === 0) {
      return next(new AppError(req.t('expense.advanceCategoryNotInRequest'), 400));
    }

    for (const category of advanceCategories) {
      const result = await AdvanceCategory.findById(category.advanceCategory);
      if (!result) {
        return res.status(400).json({
          status: constants.APIResponseStatus.Failure,
          message: req.t('expense.invalidCategory'),
        });
      }
    }

    // Update advance categories
    await AdvanceTemplateCategories.deleteMany({ advanceTemplate: advanceTemplate._id });

    if (advanceCategories && advanceCategories.length > 0) {
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
    console.error(error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('expense.internalServerError')
    });
  }
};

exports.deleteAdvanceTemplate = catchAsync(async (req, res, next) => {

  const advanceTemplate = await AdvanceTemplate.findByIdAndDelete(req.params.id);

  if (!advanceTemplate) {
    return next(new AppError(req.t('expense.advanceTemplateNotFound'), 404)
    );
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
  if (advanceTemplates) {
    for (var i = 0; i < advanceTemplates.length; i++) {
      const AdvanceTemplateCategories = await AdvanceTemplateCategory.find({})
        .where('advanceTemplate').equals(advanceTemplates[i]._id);

      if (AdvanceTemplateCategories && AdvanceTemplateCategories.length) {
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
    return next(new AppError(req.t('expense.companyIdNotFound'), 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  // Check if the user exists
  const userExists = await User.findById(req.body.user);
  if (!userExists) {
    return next(new AppError(req.t('expense.userNotFound'), 404)
    );
  }

  // Check if the advance template exists
  const advanceTemplateExists = await AdvanceTemplate.findById(req.body.advanceTemplate);
  if (!advanceTemplateExists) {
    return next(new AppError(req.t('expense.advanceTemplateNotFound'), 404)

    );
  }
  const employeeAdvanceAssignmentExists = await EmployeeAdvanceAssignment.find({}).where('user').equals(req.body.user);
  var employeeAdvanceAssignment;
  if (employeeAdvanceAssignmentExists.length <= 0) {
    employeeAdvanceAssignment = await EmployeeAdvanceAssignment.create(req.body);
  }
  else {
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
    return next(new AppError(req.t('expense.employeeAssignmentNotFound'), 404)

    );
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
    return next(new AppError(req.t('expense.employeeAssignmentNotFound'), 404)

    );
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
    return next(new AppError(req.t('expense.userNotFound'), 404)
    );
  }

  // Check if the advance template exists
  const advanceTemplateExists = await AdvanceTemplate.findById(req.body.advanceTemplate);
  if (!advanceTemplateExists) {
    return next(new AppError(req.t('expense.advanceTemplateNotFound'), 404)

    );
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
    return next(new AppError(req.t('expense.employeeAssignmentNotFound'), 404)

    );
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: employeeAdvanceAssignment,
  });
});

exports.deleteEmployeeAdvanceAssignment = catchAsync(async (req, res, next) => {
  const employeeAdvanceAssignment = await EmployeeAdvanceAssignment.findById(req.params.id);
  if (!employeeAdvanceAssignment) {
    return next(new AppError(req.t('expense.employeeAssignmentNotFound'), 404)

    );
  }
  const advanceReport = await ExpenseAdvance.find({}).where('employee').equals(employeeAdvanceAssignment.user).where('status').in(['Approved', 'Rejected', 'Cancelled']); // Filter by status
  ;
  if (advanceReport.length > 0) {
    return next(new AppError(req.t('expense.expensesNeedClosure'), 404)

    );
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

async function insertFields(category, expenseTemplateCategoryFieldValues) {
  await ExpenseTemplateCategoryFieldValues.deleteMany({ expenseTemplateCategory: category._id });

  if (expenseTemplateCategoryFieldValues.length === 0) {
    return []; // Return an empty array if there are no fields to insert
  } else {
    // Insert new fields into ExpenseTemplateCategoryFieldValues collection
    return ExpenseTemplateCategoryFieldValues.insertMany(expenseTemplateCategoryFieldValues.map(field => ({ expenseTemplateCategory: category._id, ...field })));
  }
}

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
