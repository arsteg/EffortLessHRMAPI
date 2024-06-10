const catchAsync = require('../utils/catchAsync');
const GeneralSetting = require('../models/Leave/LeaveGeneralSettingModel');
const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplate = require('../models/Leave/LeaveTemplateModel');
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const AppError = require('../utils/appError');
const TemplateCubbingRestriction = require('../models/Leave/TemplateCubbingRestrictionModel');
const EmployeeLeaveAssignment = require('../models/Leave/EmployeeLeaveAssignmentModel');
const mongoose = require("mongoose");
const LeaveGrant = require('../models/Leave/LeaveGrantModel');
const LeaveApplication = require('../models/Leave/LeaveApplicationModel');
const LeaveApplicationHalfDay = require('../models/Leave/LeaveApplicationHalfDayModel');
const User = require('../models/permissions/userModel');
 const ShortLeave = require("../models/Leave/ShortLeaveModel");
 const LeaveAssigned = require("../models/Leave/LeaveAssignedModel");
 const TemplateApplicableCategoryEmployee = require("../models/Leave/TemplateApplicableCategoryEmployeeModel");
 const userSubordinate = require('../models/userSubordinateModel');
 const { ObjectId } = require('mongodb');
exports.createGeneralSetting = catchAsync(async (req, res, next) => {
  // Retrieve companyId from cookies
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }

  // Create the general setting with the companyId
  const generalSettingData = { ...req.body, company }; // Assuming req.body contains the general setting data
  const generalSetting = await GeneralSetting.create(generalSettingData);

  res.status(201).json({
    status: 'success',
    data: generalSetting
  });
});

exports.getGeneralSettingByCompany = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findOne({
    company: req.cookies.companyId
  });   
 ;
  if (!generalSetting) {
    return next(new AppError('GeneralSetting not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: generalSetting
  });
});

exports.getGeneralSetting = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findById(req.params.id);
  if (!generalSetting) {
    return next(new AppError('GeneralSetting not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: generalSetting
  });
});

exports.updateGeneralSetting = catchAsync(async (req, res, next) => {
  const generalSetting = await GeneralSetting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!generalSetting) {
    return next(new AppError('GeneralSetting not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: generalSetting
  });
});

exports.createLeaveCategory = catchAsync(async (req, res, next) => {
  // Retrieve companyId from cookies
  const company = req.cookies.companyId;

  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }

  // Create the general setting with the companyId
  const leaveCategoryData = { ...req.body, company }; // Assuming req.body contains the general setting data
  const leaveCategory = await LeaveCategory.create(leaveCategoryData);
  res.status(201).json({
    status: 'success',
    data: leaveCategory
  });
});

exports.getLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.findById(req.params.id);
  if (!leaveCategory) {
    return next(new AppError('Leave category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: leaveCategory
  });
});

exports.getLeaveCategoryByTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateCategory = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.templateId);
  if (!leaveTemplateCategory) {
    return next(new AppError('Leave category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: leaveTemplateCategory
  });
});

exports.updateLeaveCategory = catchAsync(async (req, res, next) => {
  const leaveCategory = await LeaveCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!leaveCategory) {
    return next(new AppError('Leave category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: leaveCategory
  });
});

exports.getAllLeaveCategory = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const leaveCategory = await LeaveCategory.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));
  if (!leaveCategory) {
    return next(new AppError('Leave category not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: leaveCategory
  });
});
exports.getAllLeaveCategoryByUser = catchAsync(async (req, res, next) => {
  
  const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({}).where('user').equals(req.params.userId);
 
  const leaveTemplateCategory = await LeaveTemplateCategory.find({ leaveTemplate: employeeLeaveAssignment.leaveTemplate,isReadyForApply: true});
 
  res.status(200).json({
    status: 'success',
    data: leaveTemplateCategory
  });
});

exports.deleteLeaveCategory = catchAsync(async (req, res, next) => {
const leaveCategory = await LeaveCategory.findById(req.params.id);   
if (!leaveCategory) {
  return next(new AppError('Leave Category not found', 404));
}
//add validation for use categroy
if(leaveCategory.isSystemGenerated){
  return next(new AppError('Leave Category Sytem Generated, you can not delete found', 404));
}
else
{
  
  const leaveTemplateCategory = await LeaveTemplateCategory.find({}).where('leaveCategory').equals(req.params.id);
  if(leaveTemplateCategory!==null){
    return next(new AppError('Leave Category Added against Leave empalte, you can not delete found', 404));
  }
  else
  {
    await LeaveCategory.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
}
});

exports.deleteLeaveTemplate = catchAsync(async (req, res, next) => {
  const leaveTemplateExists = await LeaveTemplate.findById(req.params.id);   
if (!leaveTemplateExists) {
  return next(new AppError('EmployeeLeaveAssignment not found', 404));
}
const employeeLeaveAssignment = await EmployeeLeaveAssignment.find({}).where('user').equals(leaveTemplateExists.user).where('status').in(['Approved', 'Rejected','Cancelled']); // Filter by status
console.log(employeeLeaveAssignment);
if (employeeLeaveAssignment.length>0) {
  return next(new AppError('Leave Need to close first before delete assignment', 404));
}
await LeaveTemplate.findByIdAndDelete(req.params.id);
 res.status(204).json({
   status: 'success',
   data: null,
 });
});

async function createLeaveTemplateCategories(leaveTemplateId, leaveCategories) {
  try {
    const createdCategories = await Promise.all(
      leaveCategories.map(async (leaveCategory) => {
        const newCategory = new LeaveTemplateCategory({
          leaveTemplate: leaveTemplateId,
          leaveCategory: leaveCategory.leaveCategory,
        });
        return newCategory.save();
      })
    );

    return createdCategories;
  } catch (error) {
    throw new AppError('Error creating LeaveTemplateCategory', 500);
  }
}

exports.createLeaveTemplate = catchAsync(async (req, res, next) => {
  const {
    leaveCategories,
    cubbingRestrictionCategories,
    ...leaveTemplateData
  } = req.body;

  // Check if label is provided
  if (!leaveTemplateData.label) {
    return next(new AppError('Label is required', 400));
  }
 // Extract companyId from req.cookies
 const companyId = req.cookies.companyId;
 // Check if companyId exists in cookies
 if (!companyId) {
   return next(new AppError('Company ID not found in cookies', 400));
 }
  // Check if label already exists
  const existingTemplate = await LeaveTemplate.findOne({ 'label': leaveTemplateData.label });

  if (existingTemplate) {
    return res.status(400).json({
      status: 'failure',
      message: 'Label already exists',
    });
  }

  // Check if leaveCategories is provided and valid
  if (!Array.isArray(leaveCategories) || leaveCategories.length === 0) {
    return next(new AppError('Leave Categories are required', 400));
  } 

  // Add company to the request body
  leaveTemplateData.company = companyId;

  // Create LeaveTemplate instance
  const leaveTemplate = await LeaveTemplate.create(leaveTemplateData);

  // Create LeaveTemplateCategory instances
  const createdCategories = await createLeaveTemplateCategories(leaveTemplate._id, leaveCategories);
  var createdClubbingRestrictions=null;
 // Check if cubbingRestrictionCategories is provided and valid
 if (Array.isArray(cubbingRestrictionCategories)) {  
  // Create TemplateCubbingRestriction instances
  createdClubbingRestrictions = await TemplateCubbingRestriction.insertMany(cubbingRestrictionCategories.map(category => ({
    leaveTemplate: leaveTemplate._id,
    category: category.leaveCategory,
    restrictedClubbedCategory: category.restrictedclubbedLeaveCategory
   })));
 }
 leaveTemplate.applicableCategories=createdCategories;
 leaveTemplate.clubbingRestrictions=createdClubbingRestrictions;

  // Send success response
  res.status(201).json({
    status: 'success',
    data: leaveTemplate
  });
});

exports.getLeaveTemplate = async (req, res, next) => {
    try {
        const leaveTemplate = await LeaveTemplate.findById(req.params.id);
        if (!leaveTemplate) {
            res.status(404).json({
                status: 'failure',
                message: 'LeaveTemplate not found'
            });
            return;
        }
        const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.id);
        
      
        for(var m = 0; m < leaveTemplateCategories.length; m++) {   
          
          const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[m]._id);
          if(templateApplicableCategoryEmployee) 
          {
            console.log("Hel");
            leaveTemplateCategories[m].templateApplicableCategoryEmployee=templateApplicableCategoryEmployee;
          }
          else{
            leaveTemplateCategories[m].templateApplicableCategoryEmployee=null;
          }
        }  
        leaveTemplate.applicableCategories = leaveTemplateCategories;

        const leaveClubbingRestrictions = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.id);
        leaveTemplate.clubbingRestrictions = leaveClubbingRestrictions;
        res.status(200).json({
            status: 'success',
            data: leaveTemplate
        });
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.updateLeaveTemplate = async (req, res, next) => {
    try {
      const { leaveCategories,cubbingRestrictionCategories, ...leaveTemplateData } = req.body;

      // Check if policyLabel is provided
      if (!leaveTemplateData.label) {
        return next(new AppError('Label is required', 400));
      }
    
      // Check if policyLabel already exists
      const existingTemplate = await LeaveTemplate.findOne({ 'label': leaveTemplateData.Label ,_id: { $ne: req.params.id }});
    
      if (existingTemplate) {
        return res.status(400).json({
          status: 'failure',
          message: 'Leave Template Label already exists',
        });
      }
      if (!Array.isArray(leaveCategories) || leaveCategories.length === 0) {
        return next(new AppError('Leave Category Not Exists in Request', 400));
      }
        // Extract companyId from req.cookies
 
      for (const category of leaveCategories) {
        const result = await LeaveCategory.findById(category.leaveCategory);
        console.log(result);
        if (!result) {
          return res.status(400).json({
            status: 'failure',
            message: 'Invalid Category',
          });
        }
      }

  
        const leaveTemplate = await LeaveTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!leaveTemplate) {
            res.status(404).json({
                status: 'failure',
                message: 'LeaveTemplate not found'
            });
            return;
        }
        leaveTemplate.leaveCategories = await updateOrCreateLeaveTemplateCategories(req.params.id, req.body.leaveCategories);
       
        await TemplateCubbingRestriction.deleteMany({
           leaveCategory: leaveTemplate._id,
        });
        if (Array.isArray(cubbingRestrictionCategories)) {  
          // Create TemplateCubbingRestriction instances
          leaveTemplate.clubbingRestrictions = await TemplateCubbingRestriction.insertMany(cubbingRestrictionCategories.map(category => ({
            leaveTemplate: leaveTemplate._id,
            category: category.leaveCategory,
            restrictedClubbedCategory: category.restrictedclubbedLeaveCategory
           })));
         }
        res.status(200).json({
            status: 'success',
            data: leaveTemplate
        });
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

async function updateOrCreateLeaveTemplateCategories(leaveTemplateId, updatedCategories) {
  const existingCategories = await LeaveTemplateCategory.find({ leaveTemplate: leaveTemplateId });

  // Update existing and create new categories
  const updatedCategoriesPromises = updatedCategories.map(async (category) => {
   
    const existingCategory = existingCategories.find(
      (existing) => existing.leaveCategory.equals(category.leaveCategory)
    );
    if (!existingCategory) {
     // Create new category
      const newCategory = new LeaveTemplateCategory({
        leaveTemplate: leaveTemplateId,
        ...category,
      });
      return newCategory.save();
    }
  });
    // Remove categories not present in the updated list
  const categoriesToRemove = existingCategories.filter(
    (existing) => !updatedCategories.find((updated) => updated.leaveCategory === existing.leaveCategory.toString())
  );
  

  const removalPromises = categoriesToRemove.map(async (category) => {
    return LeaveTemplateCategory.findByIdAndRemove(category._id);
  });

  await Promise.all(removalPromises);
  const finalCategories = await LeaveTemplateCategory.find({ leaveTemplate: leaveTemplateId });
  return finalCategories;

}

exports.getAllLeaveTemplates = async (req, res, next) => {
    try {
        const skip = parseInt(req.body.skip) || 0;
        const limit = parseInt(req.body.next) || 10;
        const leaveTemplates = await LeaveTemplate.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
        .limit(parseInt(limit));
        if(leaveTemplates)
        {
        for(var i = 0; i < leaveTemplates.length; i++) {   
          const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(leaveTemplates[i]._id);
          if(leaveTemplateCategories) 
          {
            for(var m = 0; m < leaveTemplateCategories.length; m++) {   
          
              const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[m]._id);
              if(templateApplicableCategoryEmployee) 
              {
                console.log("Hel");
                leaveTemplateCategories[m].templateApplicableCategoryEmployee=templateApplicableCategoryEmployee;
              }
              else{
                leaveTemplateCategories[m].templateApplicableCategoryEmployee=null;
              }
            }  
            leaveTemplates[i].applicableCategories=leaveTemplateCategories;
          }
          else{
            leaveTemplates[i].applicableCategories=null;
          }
          const leaveClubbingRestrictions = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(leaveTemplates[i]._id);
        
          if(leaveClubbingRestrictions) 
            {
              leaveTemplates[i].clubbingRestrictions = leaveClubbingRestrictions;
            }
            else{
              leaveTemplates[i].clubbingRestrictions = null;
            }
        }
        }
        res.status(200).json({
            status: 'success',
            data: leaveTemplates
        });
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

// Create a new LeaveTemplateCategory
exports.createLeaveTemplateCategory = catchAsync(async (req, res, next) => {
  
  const { leaveTemplate, leaveCategories } = req.body;
  // Validate incoming data
  if (!leaveTemplate || !leaveCategories || !Array.isArray(leaveCategories) || leaveCategories.length === 0) {
    return next(new AppError('Invalid request data', 400));
  }
  for (const category of leaveCategories) {    
      const result = await LeaveCategory.findById(category.leaveCategory);
      if (!result) {
        return res.status(400).json({
          status: 'failure',
          message: 'Invalid Category',
        });      
    }
  }
  // Iterate through LeaveCategories to create or update records
  const leaveTemplateCategories =  await createLeaveTemplateCategories(mongoose.Types.ObjectId(leaveTemplate), leaveCategories);
  for(var i = 0; i < leaveTemplateCategories.length; i++) {   
    const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[i]._id);
    if(templateApplicableCategoryEmployee) 
    {
      leaveTemplateCategories[i].templateApplicableCategoryEmployee=templateApplicableCategoryEmployee;
    }
    else{
      leaveTemplateCategories[i].templateApplicableCategoryEmployee=null;
    }
  }  
  res.status(201).json({
      status: 'success',
      data: leaveTemplateCategories     
    });

});

async function createLeaveTemplateCategories(leaveTemplateId, leaveCategories) {
    try {
      const updatedCategories = await Promise.all(
        leaveCategories.map(async (category) => {
          const {
            users,
            ...grantData
          } = category;
          const existingCategory = await LeaveTemplateCategory.findOne({
            leaveCategory: category.leaveCategory,
            leaveTemplate: leaveTemplateId,
          });
  
          let categoryResult;
          if (existingCategory) {
            grantData.isReadyForApply=true;
            categoryResult = await LeaveTemplateCategory.findByIdAndUpdate(
              existingCategory._id,
              { $set: { ...grantData } },
              { new: true }
            );
          } else {
            const newCategory = new LeaveTemplateCategory({
              leaveTemplate: leaveTemplateId,
              ...grantData,
            });
            categoryResult = await newCategory.save();
          }
  
          const userOperations = users.map(async (user) => {
            console.log(user);
            const filter = {
              leaveTemplateCategory: existingCategory ? existingCategory._id : categoryResult._id,
              user: user.user
            };
            const update = {
              leaveTemplateCategory: existingCategory ? existingCategory._id : categoryResult._id,
              user: user.user
            };
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  
            return TemplateApplicableCategoryEmployee.findOneAndUpdate(filter, update, options);
          });
  
          await Promise.all(userOperations);
  
          return categoryResult;
        })
      );
  
      return updatedCategories;
    } catch (err) {
      throw new AppError('Internal server error', 500);
    }
}

// Get a LeaveTemplateCategory by ID
exports.getLeaveTemplateCategoryByTemplate = catchAsync(async (req, res, next) => {
    const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('leaveTemplate').equals(req.params.leaveTemplateId);;
    if (!leaveTemplateCategories) {
        return next(new AppError('LeaveTemplateCategory not found', 404));
    }
    for(var i = 0; i < leaveTemplateCategories.length; i++) {   
      const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[i]._id);
      if(templateApplicableCategoryEmployee) 
      {
        leaveTemplateCategories[i].templateApplicableCategoryEmployee=templateApplicableCategoryEmployee;
      }
      else{
        leaveTemplateCategories[i].templateApplicableCategoryEmployee=null;
      }
    }  
    res.status(200).json({
        status: 'success',
        data: leaveTemplateCategories
    });
});

// Get all LeaveTemplateCategories
exports.getAllLeaveTemplateCategories = catchAsync(async (req, res, next) => {
    const leaveTemplateCategories = await LeaveTemplateCategory.find({}).where('company').equals(req.cookies.companyId);
    for(var i = 0; i < leaveTemplateCategories.length; i++) {   
      const templateApplicableCategoryEmployee = await TemplateApplicableCategoryEmployee.find({}).where('leaveTemplateCategory').equals(leaveTemplateCategories[i]._id);
      if(templateApplicableCategoryEmployee) 
      {
        leaveTemplateCategories[i].templateApplicableCategoryEmployee=templateApplicableCategoryEmployee;
      }
      else{
        leaveTemplateCategories[i].templateApplicableCategoryEmployee=null;
      }
    }  
    res.status(200).json({
        status: 'success',
        data: leaveTemplateCategories
    });
});

exports.createEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {
  // Extract companyId from req.cookies
  const companyId = req.cookies.companyId;
  // Check if companyId exists in cookies
  if (!companyId) {
    return next(new AppError('Company ID not found in cookies', 400));
  }
  // Add companyId to the request body
  req.body.company = companyId;
  const employeeLeaveAssignmentExists = await EmployeeLeaveAssignment.find({}).where('user').equals(req.body.user);
  var employeeLeaveAssignment;
  const leaveTemplate=await LeaveTemplate.findById(req.body.leaveTemplate);   
  if (leaveTemplate && leaveTemplate.approvalType == "template-wise")
  {    
        req.body.primaryApprover = leaveTemplate.primaryApprover;
        req.body.secondaryApprover = leaveTemplate.secondaryApprover;      
  }  
  if (employeeLeaveAssignmentExists.length<=0) {   
     
     employeeLeaveAssignment = await EmployeeLeaveAssignment.create(req.body);
  }
  else{
    employeeLeaveAssignment = await EmployeeLeaveAssignment.findByIdAndUpdate(
      employeeLeaveAssignmentExists[0]._id,
     req.body,
     {
       new: true,
       runValidators: true,
     }
   );   
  }
 
 res.status(201).json({
   status: 'success',
   data: employeeLeaveAssignment,
 });
});

exports.getEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {
 const employeeLeaveAssignment = await EmployeeLeaveAssignment.findById(req.params.id);
 if (!employeeLeaveAssignment) {
   return next(new AppError('EmployeeLeaveAssignment not found', 404));
 }
 res.status(200).json({
   status: 'success',
   data: employeeLeaveAssignment,
 });
});
exports.getEmployeeLeaveAssignmentByUser = catchAsync(async (req, res, next) => {
 const employeeLeaveAssignment = await EmployeeLeaveAssignment.find({}).where('user').equals(req.params.userId);
 
 res.status(200).json({
   status: 'success',
   data: employeeLeaveAssignment,
 });
});

exports.getApplicableLeaveSettingByUser = catchAsync(async (req, res, next) => {
 const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({user:req.params.userId});
 var leaveTemplate=[];
 if (employeeLeaveAssignment) {
  
 leaveTemplate = await LeaveTemplate.findById(employeeLeaveAssignment.leaveTemplate);   
 const LeaveTemplateApplicableCategories = await LeaveTemplateApplicableCategories.find({}).where('LeaveTemplate').equals(employeeLeaveAssignment.LeaveTemplate);
 LeaveTemplate.applicableCategories = LeaveTemplateApplicableCategories;
 }
 res.status(200).json({
   status: 'success',
   data: LeaveTemplate,
 });
});

exports.deleteEmployeeLeaveAssignment = catchAsync(async (req, res, next) => {
 
//validation
const userLeaveAssignment = await EmployeeLeaveAssignment.findById(req.params.id);   
if (!userLeaveAssignment) {
 return next(new AppError('EmployeeLeaveAssignment not found', 404));
}

await EmployeeLeaveAssignment.findByIdAndDelete(req.params.id);  
 res.status(204).json({
   status: 'success',
   data: null,
 });
});

exports.getAllEmployeeLeaveAssignments = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
 const employeeLeaveAssignments = await EmployeeLeaveAssignment.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
 .limit(parseInt(limit));
 res.status(200).json({
   status: 'success',
   data: employeeLeaveAssignments,
 });
});

exports.createEmployeeLeaveGrant = catchAsync(async (req, res, next) => {  
 // Extract companyId from req.cookies
 const companyId = req.cookies.companyId;
 // Check if companyId exists in cookies
 if (!companyId) {
   return next(new AppError('Company ID not found in cookies', 400));
 }
 const {
  users,    
  ...grantData
} = req.body;
if (!Array.isArray(users) || users.length === 0) {
  return next(new AppError('users are required', 400));
} 
var leavsGrants=[];
for(var i = 0; i < users.length; i++) {
  const leavegrantExits = await LeaveGrant.findOne({
    employee: users[i].user,
    date:grantData.date
  });   
 ;
 console.log(leavegrantExits);
  if (leavegrantExits!==null) {
    return next(new AppError('Leave alredy Granted for Same user on same date', 404));
  }
  // Add company to the request body
  grantData.company = companyId;
  grantData.employee=users[i].user;
  grantData.usedOn=grantData.date;
  grantData.appliedOn=new Date();
  // Create LeaveTemplate instance
  const leaveGrant = await LeaveGrant.create(grantData);  
  leavsGrants.push(leaveGrant);
}
  // Send success response
  res.status(201).json({
    status: 'success',
    data: leavsGrants
  });
});

exports.getEmployeeLeaveGrantByUser = catchAsync(async (req, res, next) => {
   const leaveGrants = await LeaveGrant.find({}).where('employee').equals(req.params.userId);
  res.status(200).json({
    status: 'success',
    data: leaveGrants,
  });
 });

exports.getEmployeeLeaveGrantByTeam = catchAsync(async (req, res, next) => {
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
  console.log(teamIdsArray);
  if(teamIds==null)    
    {
       teamIdsArray.push(req.cookies.userId);
    } 
   
    const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
console.log(objectIdArray);
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
  const leaveGrants = await LeaveGrant.find({
    employee: { $in: objectIdArray }
}).skip(parseInt(skip))
.limit(parseInt(limit));;
 
  res.status(200).json({
    status: 'success',
    data: leaveGrants
  });
});

 exports.updateEmployeeLeaveGrant = async (req, res, next) => {
  try {
      const { id } = req.params;
      const { user, status, level1Reason, level2Reason, date, comment } = req.body;

      // Check if the leave grant exists
      const leaveGrant = await LeaveGrant.findById(id);
      if (!leaveGrant) {
          return next(new AppError('Employee Leave Grant not found', 404));
      }

      // Check if the user is valid
      const existingUser = await User.findById(user);
      if (!existingUser) {
          return next(new AppError('Invalid user', 400));
      }

      // Check if a LeaveGrant with the same date for the same user already exists
      const existingLeaveGrant = await LeaveGrant.findOne({ user, date });
      if (existingLeaveGrant && existingLeaveGrant._id.toString() !== id) {
          return next(new AppError('Leave Grant for the same user and date already exists', 400));
      }

      // Update the leave grant fields
      leaveGrant.employee = user;
      leaveGrant.status = status;
      leaveGrant.level1Reason = level1Reason;
      leaveGrant.level2Reason = level2Reason;
      leaveGrant.date = date;
      leaveGrant.comment = comment;

      // Save the updated leave grant
      await leaveGrant.save();

      res.status(200).json({
          status: 'success',
          data: leaveGrant
      });

  } catch (error) {
      next(error);
  }
};

 exports.deleteEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  

 await LeaveGrant.findByIdAndDelete(req.params.id);  
  res.status(204).json({
    status: 'success',
    data: null,
  });
 });
 
 exports.getAllEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const leaveGrants = await LeaveGrant.find({}).where('company').equals(req.cookies.companyId).skip(parseInt(skip))
  .limit(parseInt(limit));
  res.status(200).json({
    status: 'success',
    data: leaveGrants,
  });
 });

 exports.getEmployeeLeaveGrant = catchAsync(async (req, res, next) => {
  const leaveGrants = await LeaveGrant.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: leaveGrants,
  });
 });
 
 exports.createEmployeeLeaveApplication = async (req, res, next) => {
     try {
         const { employee, leaveCategory, level1Reason, level2Reason, startDate, endDate, comment, isHalfDayOption,status,haldDays } = req.body;
         
         const newLeaveApplication = await LeaveApplication.create({
             employee,
             leaveCategory,
             level1Reason,
             level2Reason,
             startDate,
             endDate,
             comment,
             isHalfDayOption,
             status,
             company: req.cookies.companyId // Assuming companyId is stored in cookies
         });
         var createdHalfDays=null;
         // Check if haldDays is provided and valid
         if (Array.isArray(haldDays)) {  
          // Create haldDays instances
          createdHalfDays = await LeaveApplicationHalfDay.insertMany(haldDays.map(haldDay => ({
            leaveApplication: newLeaveApplication._id,
            date: haldDay.date,
            dayHalf: haldDay.dayHalf
           })));
         }
         newLeaveApplication.halfDays=createdHalfDays;
         res.status(201).json({
             status: 'success',
             data: newLeaveApplication
         });
     } catch (error) {
         next(error);
     }
 };
 
 exports.updateEmployeeLeaveApplication = async (req, res, next) => {
     try {
         const { id } = req.params;
         const { haldDays, ...leaveApplicationData } = req.body;

         const updatedLeaveApplication = await LeaveApplication.findByIdAndUpdate(id, req.body, {
             new: true,
             runValidators: true
         });
         await LeaveApplicationHalfDay.deleteMany({
          leaveCategory: updatedLeaveApplication._id,
       });
       var createdHalfDays=null;
        // Check if haldDays is provided and valid
        if (Array.isArray(haldDays)) {  
          // Create haldDays instances
          createdHalfDays = await LeaveApplicationHalfDay.insertMany(haldDays.map(haldDay => ({
            leaveApplication: updatedLeaveApplication._id,
            date: haldDay.date,
            dayHalf: haldDay.dayHalf
           })));
         }
         updatedLeaveApplication.halfDays=createdHalfDays;
         if (!updatedLeaveApplication) {
             return next(new AppError('Employee Leave Application not found', 404));
         }
 
         res.status(200).json({
             status: 'success',
             data: updatedLeaveApplication
         });
     } catch (error) {
         next(error);
     }
 };
 
 exports.getEmployeeLeaveApplicationByUser = async (req, res, next) => {
     try {
         const { userId } = req.params;
         const skip = parseInt(req.body.skip) || 0;
         const limit = parseInt(req.body.next) || 10;
         const leaveApplications = await LeaveApplication.find({ employee: userId }).skip(parseInt(skip))
         .limit(parseInt(limit));
 
         if (leaveApplications.length === 0) {
             return next(new AppError('Employee Leave Applications not found', 404));
         }
         for(var i = 0; i < leaveApplications.length; i++) {   
          const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplications[i]._id);
          if(halfDays) 
          {
            leaveApplications[i].halfDays=halfDays;
          }
          else{
            leaveApplications[i].halfDays=null;
          }
        }
         res.status(200).json({
             status: 'success',
             data: leaveApplications
         });
     } catch (error) {
         next(error);
     }
 };
  
exports.getEmployeeLeaveApplicationByTeam = catchAsync(async (req, res, next) => {
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
  console.log(teamIdsArray);
  if(teamIds==null)    
    {
       teamIdsArray.push(req.cookies.userId);
    } 
   
    const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
console.log(objectIdArray);
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
  const leaveApplications = await LeaveApplication.find({
    employee: { $in: objectIdArray }
}).skip(parseInt(skip))
.limit(parseInt(limit));

for(var i = 0; i < leaveApplications.length; i++) {   
  const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplications[i]._id);
  if(halfDays) 
  {
    leaveApplications[i].halfDays=halfDays;
  }
  else{
    leaveApplications[i].halfDays=null;
  }
}
 
  res.status(200).json({
    status: 'success',
    data: leaveApplications
  });
});

 exports.deleteEmployeeLeaveApplication = async (req, res, next) => {
     try {
         const { id } = req.params;
         console.log(id);
         const deletedLeaveApplication = await LeaveApplication.findByIdAndDelete(id);
 
         if (!deletedLeaveApplication) {
             return next(new AppError('Employee Leave Application not found', 404));
         }
 
         res.status(204).json({
             status: 'success',
             data: null
         });
     } catch (error) {
         next(error);
     }
 };
 
 exports.getAllEmployeeLeaveApplication = async (req, res, next) => {
     try {
         const leaveApplications = await LeaveApplication.find({ company: req.cookies.companyId });
         for(var i = 0; i < leaveApplications.length; i++) {   
          const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplications[i]._id);
          if(halfDays) 
          {
            leaveApplications[i].halfDays=halfDays;
          }
          else{
            leaveApplications[i].halfDays=null;
          }
        }
         res.status(200).json({
             status: 'success',
             data: leaveApplications
         });
     } catch (error) {
         next(error);
     }
 };
 
 exports.getEmployeeLeaveApplication = async (req, res, next) => {
     try {
         const { id } = req.params;
         const leaveApplication = await LeaveApplication.findById(id);
           const halfDays = await LeaveApplicationHalfDay.find({}).where('leaveApplication').equals(leaveApplication._id);
          if(halfDays) 
          {
            leaveApplication.halfDays=halfDays;
          }
          else{
            leaveApplication.halfDays=null;
          }
        
         if (!leaveApplication) {
             return next(new AppError('Leave Application not found', 404));
         }
 
         res.status(200).json({
             status: 'success',
             data: leaveApplication
         });
     } catch (error) {
         next(error);
     }
 };
 
exports.addShortLeave = async (req, res, next) => {
    try {
        const company = req.cookies.companyId; // Get company from cookies
        req.body.company = company; // Set company in the request body
        const shortLeave = await ShortLeave.create(req.body);
        res.status(201).json({
            status: 'success',
            data: shortLeave
        });
    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.getShortLeave = async (req, res, next) => {
    try {
        const shortLeave = await ShortLeave.findById(req.params.id);
        if (!shortLeave) {
            res.status(404).json({
                status: 'failure',
                message: 'ShortLeave not found'
            });
        } else {
            res.status(200).json({
                status: 'success',
                data: shortLeave
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.updateShortLeave = async (req, res, next) => {
    try {
        const shortLeave = await ShortLeave.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!shortLeave) {
            res.status(404).json({
                status: 'failure',
                message: 'ShortLeave not found'
            });
        } else {
            res.status(200).json({
                status: 'success',
                data: shortLeave
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.deleteShortLeave = async (req, res, next) => {
    try {
        const shortLeave = await ShortLeave.findByIdAndDelete(req.params.id);
        if (!shortLeave) {
            res.status(404).json({
                status: 'failure',
                message: 'ShortLeave not found'
            });
        } else {
            res.status(204).json({
                status: 'success',
                data: null
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.getShortLeaveByUser = async (req, res, next) => {
    try {
      const skip = parseInt(req.body.skip) || 0;
      const limit = parseInt(req.body.next) || 10;
        const shortLeaves = await ShortLeave.find({ employee: req.params.userId}).skip(parseInt(skip))
        .limit(parseInt(limit));
            res.status(200).json({
                status: 'success',
                data: shortLeaves
            });        
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};


exports.getShortLeaveByTeam = catchAsync(async (req, res, next) => {
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
  console.log(teamIdsArray);
  if(teamIds==null)    
    {
       teamIdsArray.push(req.cookies.userId);
    } 
   
    const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
console.log(objectIdArray);
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
  const shortLeaves = await ShortLeave.find({
    employee: { $in: objectIdArray }
}).skip(parseInt(skip))
.limit(parseInt(limit));
 
  res.status(200).json({
    status: 'success',
    data: shortLeaves
  });
});

exports.getAllShortLeave = async (req, res, next) => {
  try {
      const shortLeaves = await ShortLeave.find({ company: req.cookies.companyId})
          res.status(200).json({
              status: 'success',
              data: shortLeaves
          });
      
  } catch (err) {
      res.status(500).json({
          status: 'failure',
          message: err.message
      });
  }
};

exports.getLeaveBalance = async (req, res, next) => {
  try {
      const leaveAssigned = await LeaveAssigned.find({ company: req.cookies.companyId}).where('employee').equals(req.body.user).where('cycle').equals(req.body.cycle).where('category').equals(req.body.category);
          res.status(200).json({
              status: 'success',
              data: leaveAssigned
          });
      
  } catch (err) {
      res.status(500).json({
          status: 'failure',
          message: err.message
      });
  }
};

exports.getLeaveBalanceByTeam = catchAsync(async (req, res, next) => {
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
  console.log(teamIdsArray);
  if(teamIds==null)    
    {
       teamIdsArray.push(req.cookies.userId);
    } 
   
    const objectIdArray = teamIdsArray.map(id => new ObjectId(id));
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;
  const leaveBalances = await LeaveAssigned.find({
    employee: { $in: objectIdArray }
});
 
  res.status(200).json({
    status: 'success',
    data: leaveBalances
  });
});

exports.assignLeavesByJobs = async () => {
console.log("Called");
const users = await User.find({}); 
if(users.length > 0)
{
  for (const user of users) {  
   const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({}).where('user').equals(user._id.toString());

if(employeeLeaveAssignment)
{
  console.log(employeeLeaveAssignment.leaveTemplate.toString());
  
        console.log("Called2");
        const leaveTemplateCategory = await LeaveTemplateCategory.findOne({}).where('leaveTemplate').equals(employeeLeaveAssignment.leaveTemplate.toString());
        if (leaveTemplateCategory) {
        console.log("Called4");
       const leaveCategory =await  LeaveCategory.findById("65e5d2a0ef825624d35ffd0e");      
       const cycle = "JANUARY_2023-DECEMBER_2024";
       const employee = user._id.toString();
       const category=leaveCategory._id;
       const type = leaveCategory.leaveAccrualPeriod;
       const createdOn = new Date();
       const startMonth = createdOn.getMonth();        
       const openingBalance = 0;
       const leaveApplied = 0;      
       const leaveRemaining = 0;
       const closingBalance = 0;
       const leaveTaken=0;
        if(leaveCategory.leaveAccrualPeriod === "Monthly")
       {        
       
       const endMonth=createdOn.getMonth();     
       const accruedBalance=leaveTemplateCategory.accrualRatePerPeriod;
     
       const leaveAssigned = await LeaveAssigned.create({
          cycle,
          employee,
          category,
          type,
          createdOn,
          startMonth,
          endMonth,
          openingBalance,
          leaveApplied,
          accruedBalance,
          leaveRemaining,
          closingBalance,
          leaveTaken,
          company: req.cookies.companyId // Assuming companyId is stored in cookies
      });
       }
       if(leaveCategory.leaveAccrualPeriod === "Annually")
       {
        
        const endMonth=createdOn.getMonth();
        endMonth.setMonth(startMonth.getMonth() + 12);      
        const accruedBalance = leaveTemplateCategory.accrualRatePerPeriod;       
        const leaveAssigned =  LeaveAssigned.create({
           cycle,
           employee,
           category,
           type,
           createdOn,
           startMonth,
           endMonth,
           openingBalance,
           leaveApplied,
           accruedBalance,
           leaveRemaining,
           closingBalance,
           leaveTaken,
           company: req.cookies.companyId // Assuming companyId is stored in cookies
       });
        
       }
       if(leaveCategory.leaveAccrualPeriod === "semi-annually")
       {            
       
       const endMonth = startMonth + 6;    
       console.log(leaveTemplateCategory);
       const accruedBalance= 2;//leaveTemplateCategory.accrualRatePerPeriod;
       console.log("Semi annually called" + "cycle"+cycle+"employee"+employee._id+"category"+category+"type"+type+"createdOn"+createdOn+"startMonth"+startMonth+
       "endMonth"+endMonth+"openingBalance"+openingBalance+"leaveApplied"+leaveApplied+"accruedBalance"+accruedBalance+"leaveRemaining"+leaveRemaining
       +"closingBalance"+ closingBalance +"leaveTaken"+leaveTaken);
       const existingLeaveAssignment = await LeaveAssigned.findOne({
        employee: employee,
        category: category,
        startMonth: startMonth,
        endMonth: endMonth
        
    });
   
    if (existingLeaveAssignment) {
        console.log('Leave assignment already exists for this employee, category');
        // Handle the case where the leave assignment already exists
    }
     else 
    {
      const leaveAssigned =await LeaveAssigned.create({
           cycle,
           employee,
           category,
           type,
           createdOn,
           startMonth,
           endMonth,
           openingBalance,
           leaveApplied,
           accruedBalance,
           leaveRemaining,
           closingBalance,
           leaveTaken,
           company: leaveCategory.company.toString() // Assuming companyId is stored in cookies
       });
     //  console.log(leaveAssigned);
      }
       
       }
       if(leaveCategory.leaveAccrualPeriod==="Bi-Monthly")
       {
        const endMonth=createdOn.getMonth();       
        const accruedBalance=leaveTemplateCategory.accrualRatePerPeriod;       
        const leaveAssigned =  LeaveAssigned.create({
           cycle,
           employee,
           category,
           type,
           createdOn,
           startMonth,
           endMonth,
           openingBalance,
           leaveApplied,
           accruedBalance,
           leaveRemaining,
           closingBalance,
           leaveTaken,
           company: req.cookies.companyId // Assuming companyId is stored in cookies
       });        
       }
       if(leaveCategory.leaveAccrualPeriod==="Quaterly")
       {
        const accruedBalance=leaveTemplateCategory.accrualRatePerPeriod;
        const endMonth=createdOn.getMonth();
        endMonth.setMonth(startMonth.getMonth() + 4);
        const leaveAssigned =  LeaveAssigned.create({
           cycle,
           employee,
           category,
           type,
           createdOn,
           startMonth,
           endMonth,
           openingBalance,
           leaveApplied,
           accruedBalance,
           leaveRemaining,
           closingBalance,
           leaveTaken,
           company: req.cookies.companyId // Assuming companyId is stored in cookies
       });
      }
    }
  
  }
}
}
//loop for employee
//gettempalte for emplyee
//get cetgories from levaeteplatecategory based on template
//loop for categories
// from categories based on monthly/yearly need to create AssignedTemplate

console.log("hello");
  
}
