require('dotenv').config(); // Ensure this is at the top of the file
const Software = require('../models/pricing/softwareModel');
const Option = require('../models/pricing/optionModel');
const Plan = require('../models/pricing/planModel');
const OptionIncluded = require('../models/pricing/optionIncludedModel');
const Offer = require('../models/pricing/offerModel');
const Include = require('../models/pricing/includeModel');
const UserGroupType = require('../models/pricing/userGroupTypeModel');
const catchAsync = require('../utils/catchAsync');
const Prerequisites = require('../models/pricing/prerequisitesModel');
const CompanyPlan = require('../models/pricing/companyPlanModel');
const PlanOffer = require('../models/pricing/planOfferModel');
const Company = require('../models/companyModel');
const Subscription= require('../models/pricing/subscriptionModel');
const PlanHistory = require('../models/pricing/planHistoryModel');
const Invoice= require('../models/pricing/invoiceModel');
const User = require('../models/permissions/userModel');
const UserInGroup=require('../models/pricing/userInGroupModel');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const constants = require('../constants');
const { Constants } = require('azure-storage');
const  websocketHandler  = require('../utils/websocketHandler');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
  // headers: {
  //   "X-Razorpay-Account": "PWAQUL4NNnybvx"
  // }
});

exports.createSoftware = catchAsync(async (req, res, next) => {
  const { name,description,accessLink} = req.body;
    const softwareExists = await Software.findOne({ name: name});
    if(softwareExists)
    {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.LabelAlreadyInUse'),
      });
    }
    else{
    const software = await Software.create({ name: name,description: description,accessLink: accessLink });
  
      res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: software,
      });
    }

});  

exports.getSoftware = catchAsync(async (req, res, next) => {
const software = await Software.findById(req.params.id);
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: software,
});
});

exports.updateSoftware = catchAsync(async (req, res, next) => {
const softwareExists = await Software.findOne({ name: req.body.name, description: req.body.description,accessLink: req.body.accessLink,  _id: { $ne: req.params.id }});
if(softwareExists)
{
    res.status(500).json({
    status: constants.APIResponseStatus.Failure,
    message: req.t('pricing.LabelAlreadyInUse'),
  });
}
else
{
    const software = await Software.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: software,
    });
}
});

exports.deleteSoftware = catchAsync(async (req, res, next) => {

const softwareInstance = await Software.findById(req.params.id);
await softwareInstance.remove();
if (!softwareInstance) {
  return next(new AppError(req.t('pricing.categoryNotFound'), 404));
}

return res.status(204).json({
  status: constants.APIResponseStatus.Success,
  data: null,
});
});

exports.getAllSoftware = catchAsync(async (req, res, next) => {
const software = await Software.find({});
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: software,
});
});

exports.createOption = catchAsync(async (req, res, next) => {
  const { name} = req.body; 
    const optionExists = await Software.findOne({ name: name});
    if(optionExists)
    {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.LabelAlreadyInUseForAnotherOption'),
      });
    }
    else{
    const option = await Option.create({ name: name });
  
      res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: option,
      });
    }
});  

exports.getOption = catchAsync(async (req, res, next) => {
const option = await Option.findById(req.params.id);
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: option,
});
});

exports.updateOption = catchAsync(async (req, res, next) => {
  const {name} = req.body;
const optionExists = await Option.findOne({ name: req.body.name,  _id: { $ne: req.params.id }});
if(optionExists)
{
    res.status(500).json({
    status: constants.APIResponseStatus.Failure,
    message: req.t('pricing.LabelAlreadyInUseForAnotherOption'),
  });
}
else
{
    const option = await Option.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: option,
    });
}
});

exports.deleteOption = catchAsync(async (req, res, next) => {

const optionInstance = await Option.findById(req.params.id);
await optionInstance.remove();
if (!optionInstance) {
  return next(new AppError(req.t('pricing.categoryNotFound'), 404));
}

return res.status(204).json({
  status: constants.APIResponseStatus.Success,
  data: null,
});
});

exports.getAllOption = catchAsync(async (req, res, next) => {
const option = await Option.find({});
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: option,
});
});

exports.createPlan = catchAsync(async (req, res, next) => {
  try {
    const { name,software,currentprice,IsActive, description, notes1, notes2, frequency, interval, quantity, type, users} = req.body; 
    // const planExists = await Software.findOne({ name: name,software: software});
    const planExists = await Plan.findOne({ name: name});
    if(planExists)
    {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.LabelAlreadyInUseForAnotherPlan'),
      });
    }
    else{
      // Creating Plan in RazorPay
      const razorpayPlan = await  razorpay.plans.create({
        "period": frequency || 'monthly',
        "interval": interval || 1,
        "item": {
          "name": name,
          "amount": currentprice * 100,
          "currency": "INR",
          "description": description,
        },
        "notes": {
          "notes_key_1": notes1,
          "notes_key_2": notes2
        }
      })
      const plan = await Plan.create({ 
        name: name,
        software: software,
        currentprice: currentprice,
        IsActive: IsActive,
        planId: razorpayPlan.id, // Razorpay Plan Id
        description: description,
        notes: {
          note1: notes1,
          note2: notes2,
        },
        frequency: frequency,
        interval: interval,
        quantity: quantity || 1,
        type: type,
        users: users,
      });
      
      res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: plan,
      });
    }
  }  catch (error) {
    console.log(error, process.env.RAZORPAY_KEY);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      error: error,
    });
  }
});  

exports.getPlan = catchAsync(async (req, res, next) => {
let id;
// catching invalid id
try { id = mongoose.Types.ObjectId(req.params.id); }
catch (err) { id = null; }

const plan = await Plan.find({
  $or: [
    {_id :id},
    {name: req.params.id},
    {planId: req.params.id}
  ]
})
if(plan) {
    const softwares = await Software.find({})
      .where('_id').equals(plan.software);
    if(softwares && softwares.length) {
      plan.softwares = softwares;
    } else {
      plan.softwares = null;
    }
  
}
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: plan,
});
});

exports.updatePlan = catchAsync(async (req, res, next) => {
 
const planExists = await Plan.findOne({ name: req.body.name,software: req.body.software ,_id: { $ne: req.params.id }});
if(planExists)
{
    res.status(500).json({
    status: constants.APIResponseStatus.Failure,
    message: req.t('pricing.NameAlreadyInUseForSameSoftware'),  
  });
}
else
{
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: plan,
    });
}
});

exports.deletePlan = catchAsync(async (req, res, next) => {
const planInstance = await Plan.findById(req.params.id);
await planInstance.remove();
if (!planInstance) {
  return next(new AppError(req.t('common.recordNotFound'), 404));
}

return res.status(204).json({
  status: constants.APIResponseStatus.Success,
  data: null,
});
});

exports.getAllPlan = catchAsync(async (req, res, next) => {
const plan = await Plan.find({});
if(plan) {
  for(var i = 0; i < plan.length; i++) {
    const softwares = await Software.find({})
      .where('_id').equals(plan[i].software);

    if(softwares && softwares.length) {
      plan[i].softwares = softwares;
    } else {
      plan[i].softwares = null;
    }
  }
}
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: plan,
});
});

// Add an option to a plan
exports.addOptionInclusionDetails = async (req, res, next) => {
  try {
    const { plan, option, dateAdded, dateRemoved } = req.body;

    // Check if the plan and option exist
    const existingPlan = await Plan.findById(plan);
    const existingOption = await Option.findById(option);

    if (!existingPlan || !existingOption) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.InvalidPlan'),
      });
    }

    // Create OptionIncluded entry
    const optionIncluded = await OptionIncluded.create({
      plan,
      option,
      dateAdded,
      dateRemoved,
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: optionIncluded,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message:req.t('common.InternalServerError'),
    });
  }
};

// Remove an option from a plan
exports.removeOptionInclusionDetails = async (req, res, next) => {
  try {
    const optionIncludedId = req.params.id;

    // Check if the OptionIncluded entry exists
    const optionIncluded = await OptionIncluded.findById(optionIncludedId);

    if (!optionIncluded) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.optioninclusionNotFound'),
      });
    }

    // Delete OptionIncluded entry
    await OptionIncluded.findByIdAndDelete(optionIncludedId);

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      message: req.t('pricing.OptionSuccessfullyRemoved'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Get Option Inclusion Details by ID
exports.getOptionInclusionDetails = async (req, res, next) => {
  try {
    const optionIncludedId = req.params.id;

    // Find OptionIncluded entry by ID
    const optionIncluded = await OptionIncluded.findById(optionIncludedId);

    if (!optionIncluded) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.optioninclusionNotFound'),
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: optionIncluded,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Implementation for getAllOptionInclusionDetails
exports.getAllOptionInclusionDetails = catchAsync(async (req, res, next) => {
  const optionInclusionDetails = await OptionIncluded.find();

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: optionInclusionDetails,
  });
});

// Implementation for updateOptionInclusionDetails
exports.updateOptionInclusionDetails = catchAsync(async (req, res, next) => {
  const optionIncluded = await OptionIncluded.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!optionIncluded) {
    return next(new AppError(req.t('pricing.optioninclusionNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: optionIncluded,
  });
});

// Add an offer
exports.addOffer = async (req, res, next) => {
  try {
    const { name, startDate, endDate, description, discountPercentage, discountAmount } = req.body;

    // Create Offer entry
    const offer = await Offer.create({
      name,
      startDate,
      endDate,
      description,
      discountPercentage,
      discountAmount,
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: offer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'), 
    });
  }
};

// Remove an Offer
exports.removeOffer = async (req, res, next) => {
  try {
    const offerId = req.params.id;

    // Check if the Offer entry exists
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.offerinclusionNotFound'),
      });
    }

    // Delete Offer entry
    await Offer.findByIdAndDelete(offerId);

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      message: reeq.t('pricing.OfferSuccessfullyRemoved'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'), 
    });
  }
};

// Get Offer Inclusion Details by ID
exports.getOfferDetails = async (req, res, next) => {
  try {
    const offerId = req.params.id;

    // Find Offer entry by ID
    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        status:constants.APIResponseStatus.Failure,
        message: req.t('pricing.offerinclusionNotFound'),
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: offer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Implementation for getAllOfferDetails
exports.getAllOfferDetails = catchAsync(async (req, res, next) => {
  const offerDetails = await Offer.find();

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: offerDetails,
  });
});

// Implementation for updateOfferDetails
exports.updateOfferDetails = catchAsync(async (req, res, next) => {
  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!offer) {
    return next(new AppError(req.t('pricing.offerinclusionNotFound'), 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: offer,
  });
});


// Add a plan to an offer
exports.addIncludeDetails = catchAsync(async (req, res, next) => {
  const { plan, offer } = req.body;

  // Check if the plan and offer exist
  const existingPlan = await Plan.findById(plan);
  const existingOffer = await Offer.findById(offer);

  if (!existingPlan || !existingOffer) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('pricing.InvalidPlanOrOfferID'),
    });
  }

  // Create Include entry
  const include = await Include.create({
    plan,
    offer,
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: include,
  });
});

// Remove a plan from an offer
exports.removeIncludeDetails = catchAsync(async (req, res, next) => {
  const includeId = req.params.id;

  // Check if the Include entry exists
  const include = await Include.findById(includeId);

  if (!include) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('pricing.IncludeDetailsNotFound'),
    });
  }

  // Delete Include entry
  await Include.findByIdAndDelete(includeId);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: req.t('pricing.PlanSuccessfullyRemovedFromTheOffer'),
  });
});

// Get Include Details by ID
exports.getIncludeDetails = catchAsync(async (req, res, next) => {
  const includeId = req.params.id;

  // Find Include entry by ID
  const include = await Include.findById(includeId);

  if (!include) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('pricing.IncludeDetailsNotFound'),
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: include,
  });
});

// Update include details by ID
exports.updateIncludeDetails = catchAsync(async (req, res, next) => {
  const include = await Include.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!include) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('pricing.IncludeDetailsNotFound'),
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: include,
  });
});

// Get all include details
exports.getAllIncludeDetails = catchAsync(async (req, res, next) => {
  const includeDetails = await Include.find();

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: includeDetails,
  });
});

// Add a user group type
exports.addUserGroupType = async (req, res, next) => {
  try {
    const { typeName, membersMin, membersMax } = req.body;
    const exists = await UserGroupType.findOne({ typeName: typeName});
    if(exists)
    {
      res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('pricing.NameAlreadyInUseForAnotherUserGroup'),
      });
    }
    else{
    // Create UserGroupType entry
    const userGroupType = await UserGroupType.create({
      typeName,
      membersMin,
      membersMax,
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: userGroupType,
    });
  }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Remove a user group type
exports.removeUserGroupType = async (req, res, next) => {
  try {
    const userGroupTypeId = req.params.id;

    // Delete UserGroupType entry
    const result = await UserGroupType.findByIdAndDelete(userGroupTypeId);

    if (!result) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'User Group Type not found',
      });
    }

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      message: 'User group type successfully removed',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Get User Group Type by ID
exports.getUserGroupType = async (req, res, next) => {
  try {
    const userGroupTypeId = req.params.id;

    // Find UserGroupType entry by ID
    const userGroupType = await UserGroupType.findById(userGroupTypeId);

    if (!userGroupType) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'User Group Type not found',
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: userGroupType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Update user group type by ID
exports.updateUserGroupType = async (req, res, next) => {
  try {
    const userGroupTypeId = req.params.id;
    const exists = await UserGroupType.findOne({ typeName: req.body.typeName, _id: { $ne: req.params.id }});
    if(exists)
  {
      res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Name already in use for another User Group',
    });
    }
    else
    {
      // Update UserGroupType entry
      const userGroupType = await UserGroupType.findByIdAndUpdate(
        userGroupTypeId,
        req.body,
        { new: true, runValidators: true }
      );

      if (!userGroupType) {
        return res.status(404).json({
          status: constants.APIResponseStatus.Failure,
          message: 'User Group Type not found',
        });
      }

      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: userGroupType,
      });
    }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: constants.APIResponseStatus.Error,
        message: req.t('common.InternalServerError'),
      });
    }
};

// Get all user group types
exports.getAllUserGroupTypes = async (req, res, next) => {
  try {
    const userGroupTypes = await UserGroupType.find();

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: userGroupTypes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};


// Add a plan to an offer
exports.addPrerequisites = catchAsync(async (req, res, next) => {
  const { plan, offer } = req.body;

  // Check if the Prerequisites exist for the given plan and offer
  const existingPrerequisites = await Prerequisites.findOne({ plan, offer });

  if (existingPrerequisites) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Prerequisites already exist for the given plan and offer',
    });
  }

  // Check if the Plan and Offer exist
  const existingPlan = await Plan.findById(plan);
  const existingOffer = await Offer.findById(offer);

  if (!existingPlan || !existingOffer) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Invalid plan or offer ID',
    });
  }

  // Create Include entry
  const prerequisites = await Prerequisites.create({
    plan,
    offer,
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: prerequisites,
  });
});

// Remove a plan from an offer
exports.removePrerequisites = catchAsync(async (req, res, next) => {
  const prerequisitesId = req.params.id;

  // Check if the Include entry exists
  const prerequisites = await Prerequisites.findById(prerequisitesId);

  if (!prerequisites) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'prerequisites Details not found',
    });
  }

  // Delete prerequisites entry
  await prerequisites.findByIdAndDelete(prerequisitesId);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: 'prerequisites successfully removed',
  });
});

// Get prerequisites Details by ID
exports.getPrerequisitesDetails = catchAsync(async (req, res, next) => {
  const prerequisiteId = req.params.id;

  // Find Include entry by ID
  const prerequisites = await Prerequisites.findById(prerequisiteId);

  if (!prerequisites) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'prerequisites Details not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: prerequisites,
  });
});

// Update prerequisites details by ID
exports.updatePrerequisitesDetails = catchAsync(async (req, res, next) => {
  const { plan, offer } = req.body;

  // Check if the Prerequisites exist for the given plan and offer
  const existingPrerequisites = await Prerequisites.findOne({ plan, offer });

  if (existingPrerequisites) {
    return res.status(400).json({
      status:constants.APIResponseStatus.Failure,
      message: 'Prerequisites already exist for the given plan and offer',
    });
  }

  // Check if the Plan and Offer exist
  const existingPlan = await Plan.findById(plan);
  const existingOffer = await Offer.findById(offer);

  if (!existingPlan || !existingOffer) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Invalid plan or offer ID',
    });
  }
  const prerequisites = await Prerequisites.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!prerequisites) {
    return res.status(404).json({
      status:constants.APIResponseStatus.Failure,
      message: 'prerequisites Details not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: prerequisites,
  });
});

// Get all prerequisites details
exports.getAllPrerequisitesDetails = catchAsync(async (req, res, next) => {
  const prerequisitesDetails = await Prerequisites.find();

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: prerequisitesDetails,
  });
});

// Add a CompanyPlan 
exports.addCompanyPlan = catchAsync(async (req, res, next) => {
 const { plan, company } = req.body;
 // Check if the CompanyPlan exists for the given plan and company
 const existingCompanyPlan = await CompanyPlan.findOne({ plan, company });

 if (existingCompanyPlan) {
   return res.status(400).json({
     status: constants.APIResponseStatus.Failure,
     message: 'Company plan already exists for the given plan and company',
   });
 }
  // Check if the CompanyPlan exist
  const existingPlan = await Plan.findById(plan);
  const existingcompany = await Company.findById(company);

  if (!existingPlan || !existingcompany) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Invalid plan or offer ID',
    });
  }

  // Create Include entry
  const companyPlan = await CompanyPlan.create({
    plan,
    company,
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: companyPlan,
  });
});

// Remove a plan from an offer
exports.removeCompanyPlan = catchAsync(async (req, res, next) => {
  const companyPlanId = req.params.id;

  // Check if the Include entry exists
  const companyPlan = await CompanyPlan.findById(companyPlanId);

  if (!companyPlan) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'CompanyPlan Details not found',
    });
  }

  // Delete prerequisites entry
  await companyPlan.findByIdAndDelete(companyPlanId);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: 'CompanyPlan successfully removed',
  });
});

// Get prerequisites Details by ID
exports.getCompanyPlanDetails = catchAsync(async (req, res, next) => {
  const companyPlanId = req.params.id;

  // Find Include entry by ID
  const companyPlan = await CompanyPlan.findById(companyPlanId);

  if (!companyPlan) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'CompanyPlan Details not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: companyPlan,
  });
});

// Update prerequisites details by ID
exports.updateCompanyPlanDetails = catchAsync(async (req, res, next) => {
  const { plan, company } = req.body;
  // Check if the CompanyPlan exists for the given plan and company
  const existingCompanyPlan = await CompanyPlan.findOne({ plan, company });
 
  if (existingCompanyPlan) {
    return res.status(400).json({
      status:constants.APIResponseStatus.Failure,
      message: 'Company plan already exists for the given plan and company',
    });
  }
   // Check if the CompanyPlan exist
   const existingPlan = await Plan.findById(plan);
   const existingcompany = await Company.findById(company);
 
   if (!existingPlan || !existingcompany) {
     return res.status(400).json({
       status: constants.APIResponseStatus.Failure,
       message: 'Invalid plan or offer ID',
     });
   }
  const companyPlan = await CompanyPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!companyPlan) {
    return res.status(404).json({
      status:constants.APIResponseStatus.Failure,
      message: 'CompanyPlan Details not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: companyPlan,
  });
});

// Get all prerequisites details
exports.getAllCompanyPlan = catchAsync(async (req, res, next) => {
  const companyPlans = await CompanyPlan.find();

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: companyPlans,
  });
});


// Add a plan to an offer
exports.addPlanToOffer = catchAsync(async (req, res, next) => {
  const { plan, offer } = req.body;

  // Check if the plan and offer exist
  const existingPlan = await Plan.findById(plan);
  const existingOffer = await Offer.findById(offer);

  if (!existingPlan || !existingOffer) {
    return res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Invalid plan or offer ID',
    });
  }

  // Create Include entry
  const planOffer = await PlanOffer.create({
    plan,
    offer,
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: planOffer,
  });
});

// Remove a plan from an offer
exports.removePanFromOffer = catchAsync(async (req, res, next) => {
  const planOfferId = req.params.id;

  // Check if the Include entry exists
  const planOffer = await PlanOffer.findById(planOfferId);

  if (!planOffer) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'PlanOffer Details not found',
    });
  }

  // Delete Include entry
  await PlanOffer.findByIdAndDelete(planOfferId);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    message: 'Plan successfully removed from the offer',
  });
});

// Get Include Details by ID
exports.getPlanOfferDetails = catchAsync(async (req, res, next) => {
  const planOfferId = req.params.id;

  // Find Include entry by ID
  const planOffer = await PlanOffer.findById(planOfferId);

  if (!planOffer) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'PlanOffer Details not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: planOffer,
  });
});

// Update include details by ID
exports.updatePlanOfferDetails = catchAsync(async (req, res, next) => {
  const planOffer = await PlanOffer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!include) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'PlanOffer Details not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: planOffer,
  });
});

// Get all include details
exports.getAllPlanOfferDetails = catchAsync(async (req, res, next) => {
  const planOffer = await PlanOffer.find();

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: planOffer,
  });
});

exports.addSubscriptionDetails = async (req, res) => {
  try {

    // Check if currentPlanId ID is valid
    const isValidCurrentPlan = await Plan.findById(req.body.currentPlanId);
    if (!isValidCurrentPlan) {
      return res.status(400).json({ error: 'Invalid currentPlanId ID' });
    }

    const subscriptions = await Subscription.find({
      companyId: req.cookies.companyId,
      "razorpaySubscription.status": {$nin: ["cancelled"]}
    });
    // If already have a subscription wth selected plan
    const subscription = subscriptions.find(subs => {
      return subs.currentPlanId._id.toString() === req.body.currentPlanId && 
      subs.razorpaySubscription.status === 'created'
    });
    if(subscription) {
      res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: {subscription},
      });
    } else {

      const subscription = await Subscription.find({
        "razorpaySubscription.status": 'created',
        "companyId": req.cookies.companyId
      });
      if(subscription.length > 0) {
        subscription.forEach(async (subs) => {
          razorpay.subscriptions.cancel(subs.subscriptionId);
          Subscription.findOneAndUpdate(subs._id, {
            "razorpaySubscription.status": 'cancelled'
          });
        });
      }

      // Fetch Razorpay plan id from mongoDb Plans
      const razorpayPlanid = isValidCurrentPlan.planId
  
      // Create new Subscription in Razorpay
      const razorpaySubscription = await razorpay.subscriptions.create({
        "plan_id": razorpayPlanid,
        "quantity": req.body.quantity || 1, // number of licenses
        "total_count": 120
      })
      // Create a new subscription instance
      const newSubscription = new Subscription({
        userGroupType: req.body.userGroupType,
        trialPeriodStartDate: req.body.trialPeriodStartDate,
        trialPeriodEndDate: req.body.trialPeriodEndDate,
        subscriptionAfterTrial: req.body.subscriptionAfterTrial,
        currentPlanId: req.body.currentPlanId,
        offer: req.body.offer,
        offerStartDate: req.body.offerStartDate,
        offerEndDate: req.body.offerEndDate,
        dateSubscribed: req.body.dateSubscribed,
        validTo: req.body.validTo,
        dateUnsubscribed: req.body.dateUnsubscribed,
        subscriptionId: razorpaySubscription.id,
        companyId: req.cookies.companyId,
        razorpaySubscription: razorpaySubscription
      });
  
      // Save the new subscription to the database
      const savedSubscription = await newSubscription.save();
  
      res.status(201).json({
        status: constants.APIResponseStatus.Success,
        data: {
          subscription: savedSubscription,
        },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.removeSubscriptionDetails = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }

    // Find and remove the subscription
    const removedSubscription = await Subscription.findByIdAndRemove(subscriptionId);

    if (!removedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.getSubscriptionDetailsById = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    // Find the subscription by ID
    const subscription = await Subscription.findOne({
        subscriptionId: subscriptionId
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        subscription,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.getNextPaymentDetails = async (req, res) => {
  try {
    console.log("getNextPaymentDetails called");

    const user = req.user;
    console.log("User:", user);

    const subscription = await Subscription.findOne({
      companyId: user.company.id,
      "razorpaySubscription.status": {$in: constants.Active_Subscription}
    });

    console.log("Subscription:", subscription);

    if (!subscription) {
      console.log("Subscription not found");
      return res.status(404).json({ 
        status: constants.APIResponseStatus.Failure,
        message: "Subscription not found",
        data: {
          due_date:null,
          due_amount:0,
          new_users_amount:0,
          total_due_amount:0
        },
      });
    }

    let due_date = "";
    let due_amount = 0;
    let new_users_amount = 0;

    if (subscription.razorpaySubscription.current_end) {
      due_date = new Date(subscription.razorpaySubscription.current_end * 1000).toISOString();
    } else if(subscription.razorpaySubscription.charge_at) {
      due_date = new Date(subscription.razorpaySubscription.charge_at * 1000).toISOString();
    } 
    console.log("Due date:", due_date);

    if (subscription.currentPlanId.currentprice) {
      due_amount = subscription.currentPlanId.currentprice;
    }
    console.log("Due amount (before quantity adjustment):", due_amount);

    if (subscription.razorpaySubscription.quantity > 1) {
      due_amount = due_amount * subscription.razorpaySubscription.quantity;
    }
    console.log("Due amount (after quantity adjustment):", due_amount);

    if (subscription.pendingUpdates.length > 0) {
      new_users_amount = subscription.pendingUpdates.length * subscription.currentPlanId.currentprice;
    }
    console.log("New users amount:", new_users_amount);

    let total_due_amount = due_amount;
    if (new_users_amount) {
      total_due_amount = new_users_amount + due_amount;
    }
    console.log("Total due amount:", total_due_amount);

    if(subscription.scheduledChanges && subscription.scheduledChanges.planId){
      due_date = new Date(subscription.scheduledChanges.charge_at*1000).toISOString();
      console.log("Scheduled Change - Due date:", due_date);

      due_amount = subscription.scheduledChanges.planPrice * subscription.scheduledChanges.quantity;
      console.log("Scheduled Change - Due amount (before quantity adjustment):", due_amount);
      console.log("Scheduled Change - Due amount (after quantity adjustment):", subscription.scheduledChanges.planPrice);

      new_users_amount = 0;
      total_due_amount = due_amount;
      console.log("Scheduled Change - Total due amount:", total_due_amount);
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        due_date,
        due_amount,
        new_users_amount,
        total_due_amount
      },
    });
  } catch (err) {
    console.error("Error in getNextPaymentDetails:", err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: "Internal server error",
    });
  }
};


exports.getLastInvoice = async (req, res) => {
  try {
    const user = req.user;
    const invoice = await Invoice.find({
      companyId: user.company.id,
    }).sort({date: -1}).limit(1);

    const amount = invoice[0]?.amount || 0;
    const payment_method = invoice[0]?.payment_info?.method;

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        amount: amount,
        payment_method: payment_method
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.activateSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    // Find the subscription by ID and update its status to 'active'
    await Subscription.findOneAndUpdate(
      { subscriptionId: subscriptionId },
      { "razorpaySubscription.status": 'active' }
    );

    // Fetch the updated subscription
    const updatedSubscription = await Subscription.findOne({ subscriptionId: subscriptionId });

    if (!updatedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        subscription: updatedSubscription,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
}

function getFrequencyDays(frequency) {
  switch (frequency) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'monthly':
      return 30;
    case 'yearly':
      return 365;
    default:
      return 0;
  }
}

exports.updateSubscriptionDetails = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const rpSubscription = subscription.razorpaySubscription;
    const currentPlanFrequency = subscription.currentPlanId.frequency;
    const frequency = getFrequencyDays(currentPlanFrequency);
    const planPricePerDay = subscription.currentPlanId.currentprice / frequency;
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const remainingDays = Math.max(0, Math.floor((rpSubscription.current_end - currentTimestamp) / 86400)); // Convert seconds to days
    const remainingAmount = Math.max(0, Math.round(remainingDays * planPricePerDay)); // Remaining balance
    console.log("Remaining:", remainingDays, remainingAmount);
    console.log('Current subscription:', subscription);

    if(Object.keys(req.body).length === 0){
      return res.status(400).json({ error: "Please provide the fields to update" });
    }
    // Convert currentPlanId to ObjectId if it's a valid string
    const { currentPlanId } = req.body;
    if(currentPlanId){
      if(currentPlanId === subscription.currentPlanId){
        return res.status(400).json({ error: "Please select the different plan" });
      }
      
      if (mongoose.Types.ObjectId.isValid(currentPlanId)) {
        req.body.currentPlanId = new mongoose.Types.ObjectId(currentPlanId);
      } else {
        return res.status(400).json({ error: "Invalid currentPlanId" });
      }
  
      const planDetails = await Plan.findById(currentPlanId);
      if(!planDetails) return res.status(404).json({ error: "Plan not found" });
      // Number of days in new plan
      const newPlanFrequency = getFrequencyDays(planDetails.frequency);
      const newPlanPricePerDay = planDetails.currentprice / newPlanFrequency;
      const daysForNewPlan = Math.floor(remainingAmount / newPlanPricePerDay) || 1;
      const newStartDate = Math.floor(Date.now() / 1000) + daysForNewPlan * 86400; // Future start time
      console.log("Charge subscription after these many days: ", daysForNewPlan);

      if(req.body.confirmation){
        return res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: {
            startDate: newStartDate,
            daysRemaining: daysForNewPlan,
            remainingDays: remainingDays,
            remainingAmount: remainingAmount,
          },
        });    
      }

      // cancel existing subscription
      const cancelSubscription = await razorpay.subscriptions.cancel(subscription.subscriptionId, false);
      console.log('Cancelled subscription:', cancelSubscription);
      //start new subscription with new plan
      if(cancelSubscription){
        const razorpayPlanid = planDetails.planId;
        const newRpSubscription = await razorpay.subscriptions.create({
          "plan_id": razorpayPlanid,
          "quantity": 1,
          "total_count": 120,
          "start_at" : newStartDate
        });
        const newSubscription = new Subscription({
          currentPlanId: req.body.currentPlanId,
          subscriptionId: newRpSubscription.id,
          companyId: req.cookies.companyId,
          razorpaySubscription: newRpSubscription
        });
    
        // Save the new subscription to the database
        const savedSubscription = await newSubscription.save().then(s => s.populate('currentPlanId'));
        res.status(200).json({
          status: constants.APIResponseStatus.Success,
          data: {
            subscription: savedSubscription,
          },
        });      
      } else {
        res.status(400).json({ error: "Unable to change the plan" });
      }
    } else {
      // Find the subscription by ID and update
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        subscriptionId,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedSubscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: {
          subscription: updatedSubscription,
        },
      });
    }
  } catch (err) {
    console.error('err',err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
      error: err
    });
  }
};

exports.cancelSubscriptionUpdates = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // fetch pending updates
    const pendingUpdates = await razorpay.subscriptions.pendingUpdate(subscription.subscriptionId);
    if(pendingUpdates){
      await razorpay.subscriptions.cancelScheduledChanges(subscription.subscriptionId);
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        subscriptionId,
        {scheduledChanges: null},
        { new: true, runValidators: true }
      );
      if (!updatedSubscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      return res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: {
          subscription: updatedSubscription,
        },
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        subscription: updatedSubscription,
      },
    });
  } catch (err) {
    console.error('err',err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.getAllSubscriptionDetails = async (req, res) => {
  try {
    // Fetch all subscriptions
    const subscriptions = await Subscription.aggregate([
      {
        $lookup: {
        from: "companies",              // The collection to join with
        let: { company_id: { $toObjectId: "$companyId" } },  // Convert companyID to ObjectId
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$company_id"] }  // Match the converted company_id with _id in companies
            }
          }
        ],
        as: "companyDetails"            // The alias for the joined data (an array of matched documents)
      }
    },
    {
      $unwind: "$companyDetails"        // Flatten the result to get a single company object per subscription
    }]);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        subscriptions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.pauseResumeSubscription = async (req, res) => {
  try {
    const subscriptionId = req.body.subscriptionId;
    const action = req.body.action || 'pause'; // pause or resume
    let subscription;
    if(action === 'pause'){
      subscription = await razorpay.subscriptions.pause(subscriptionId,{
        "pause_at" : 'now'
      });
    } else {
      subscription = await razorpay.subscriptions.resume(subscriptionId,{
        "resume_at" : 'now'
      });
    }
    // Find the subscription by subscriptionId and update
    const updatedSubscription = await Subscription.findOneAndUpdate(
      {subscriptionId: subscriptionId},
      {razorpaySubscription: subscription}
    );

    if (!updatedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        subscription: updatedSubscription,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      status: constants.APIResponseStatus.Error,
      message: err?.error?.description || req.t('common.InternalServerError'),
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscriptionId = req.body.subscriptionId;
    const cancelAtCycleEnd = req.body.cancelAtCycleEnd === 0 ? 0 : 1; // default is 1, if no value is provided
    const subscription = await razorpay.subscriptions.cancel(subscriptionId, 
      cancelAtCycleEnd === 1 
    );
    
    // Find the subscription by subscriptionId and update
    const updatedSubscription = await Subscription.findOneAndUpdate(
      {subscriptionId: subscriptionId},
      {
        razorpaySubscription: subscription,
        dateUnsubscribed: new Date()
      }
    );

    const fetchedSubscription = await Subscription.findOne({
      subscriptionId: subscriptionId
    })

    if (!updatedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        subscription: fetchedSubscription,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      status:constants.APIResponseStatus.Error,
      message: err?.error?.description || req.t('common.InternalServerError'),
    });
  }
};

exports.createPlanHistory = async (req, res) => {
  try {
    // Assuming req.body contains the necessary data for creating a new plan history
    const { subscriptionId, planId, startDate, endDate } = req.body;
console.log("hello");
    // Validate if the provided IDs are valid MongoDB IDs
    if (
      !mongoose.Types.ObjectId.isValid(subscriptionId) ||
      !mongoose.Types.ObjectId.isValid(planId)
    ) {
      return res.status(400).json({ error: 'Invalid subscriptionId or planId' });
    }

    // Check if the subscription with the provided ID exists
    const existingSubscription = await Subscription.findById(subscriptionId);
    if (!existingSubscription) {
      return res.status(400).json({ error: 'Subscription not found' });
    }

    // Check if the plan with the provided ID exists
    const existingPlan = await Plan.findById(planId);
    if (!existingPlan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    // Create a new plan history
    const newPlanHistory = await PlanHistory.create({
      subscription: subscriptionId,
      plan: planId,
      startDate,
      endDate,
    });

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        planHistory: newPlanHistory,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.getPlanHistoryById = async (req, res) => {
  try {
    const planHistoryId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(planHistoryId)) {
      return res.status(400).json({ error: 'Invalid plan history ID' });
    }

    // Find the plan history by ID
    const planHistory = await PlanHistory.findById(planHistoryId);

    if (!planHistory) {
      return res.status(404).json({ error: 'Plan history not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        planHistory,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.updatePlanHistoryById = async (req, res) => {
  try {
    const planHistoryId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(planHistoryId)) {
      return res.status(400).json({ error: 'Invalid plan history ID' });
    }

    // Check if the plan history with the provided ID exists
    const existingPlanHistory = await PlanHistory.findById(planHistoryId);
    if (!existingPlanHistory) {
      return res.status(404).json({ error: 'Plan history not found' });
    }

    // Validate if the provided planId is a valid MongoDB ID
    if (req.body.planId && !mongoose.Types.ObjectId.isValid(req.body.planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Check if the plan with the provided ID exists
    if (req.body.planId) {
      const existingPlan = await Plan.findById(req.body.planId);
      if (!existingPlan) {
        return res.status(400).json({ error: 'Plan not found' });
      }
    }

    // Validate if the provided subscriptionId is a valid MongoDB ID
    if (
      req.body.subscriptionId &&
      !mongoose.Types.ObjectId.isValid(req.body.subscriptionId)
    ) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }

    // Check if the subscription with the provided ID exists
    if (req.body.subscriptionId) {
      const existingSubscription = await Subscription.findById(
        req.body.subscriptionId
      );
      if (!existingSubscription) {
        return res.status(400).json({ error: 'Subscription not found' });
      }
    }

    // Update the plan history by ID
    const updatedPlanHistory = await PlanHistory.findByIdAndUpdate(
      planHistoryId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        planHistory: updatedPlanHistory,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.deletePlanHistoryById = async (req, res) => {
  try {
    const planHistoryId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(planHistoryId)) {
      return res.status(400).json({ error: 'Invalid plan history ID' });
    }

    // Check if the plan history with the provided ID exists
    const existingPlanHistory = await PlanHistory.findById(planHistoryId);
    if (!existingPlanHistory) {
      return res.status(404).json({ error: 'Plan history not found' });
    }

    // Delete the plan history by ID
    await PlanHistory.findByIdAndDelete(planHistoryId);

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.getAllPlanHistories = async (req, res) => {
  try {
    // Retrieve all plan histories
    const allPlanHistories = await PlanHistory.find();

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        planHistories: allPlanHistories,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};
// Controller method
exports.createInvoice = async (req, res) => {
  try {
    // Validate if the provided subscription ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.body.subscription)) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }

    // Check if the subscription with the provided ID exists
    const existingSubscription = await Subscription.findById(req.body.subscription);
    if (!existingSubscription) {
      return res.status(400).json({ error: 'Subscription not found' });
    }

    // Validate if the provided plan history ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.body.planHistory)) {
      return res.status(400).json({ error: 'Invalid plan history ID' });
    }

    // Check if the plan history with the provided ID exists
    const existingPlanHistory = await PlanHistory.findById(req.body.planHistory);
    if (!existingPlanHistory) {
      return res.status(400).json({ error: 'Plan history not found' });
    }

    // Create a new invoice
    const newInvoice = new Invoice({
      date: req.body.date,
      subscription: req.body.subscription,
      planHistory: req.body.planHistory,
      invoicePeriodStartDate: req.body.invoicePeriodStartDate,
      invoicePeriodEndDate: req.body.invoicePeriodEndDate,
      description: req.body.description,
      amount: req.body.amount,
      dueDate: req.body.dueDate,
      IsPaid: req.body.IsPaid,
    });

    // Save the new invoice to the database
    const savedInvoice = await newInvoice.save();

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: {
        invoice: savedInvoice,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Controller method
exports.getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    // Check if the invoice with the provided ID exists
    const invoice = await Invoice.findById(invoiceId)
      .populate('subscription', 'planHistory')
      .exec();

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        invoice: invoice,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};
exports.getInvoiceBySubscriptionId = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    // Validate if subscription ID is provided 
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }
    let payload = { subscriptionId: subscriptionId };
    // Fetch subscription to check if subscription has customer_id
    const subscription = await Subscription.findOne(payload);
    if(subscription && subscription.razorpaySubscription.customer_id){
      payload = {"payment_info.customer_id": subscription.razorpaySubscription.customer_id}
    }
    payload = { subscription_id: subscriptionId };
    const invoice = await Invoice.find(payload)
      .populate('subscription')
      .exec();

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        invoice: invoice,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

exports.getInvoiceByCompanyId = async (req, res) => {
  try {
    const companyId = req.cookies.companyId || req.body.id;

    // Validate if subscription ID is provided 
    if (!companyId) {
      return res.status(400).json({ error: 'Invalid companyId ID' });
    }
    let payload = { companyId: companyId };
    const invoice = await Invoice.find(payload)
      .populate('subscription')
      .exec();

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        invoice: invoice,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Controller method
exports.updateInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    // Check if the invoice with the provided ID exists
    const existingInvoice = await Invoice.findById(invoiceId);
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Validate if the provided subscriptionId is a valid MongoDB ID
    if (
      req.body.subscriptionId &&
      !mongoose.Types.ObjectId.isValid(req.body.subscriptionId)
    ) {
      return res.status(400).json({ error: 'Invalid subscription ID' });
    }

    // Check if the subscription with the provided ID exists
    if (req.body.subscriptionId) {
      const existingSubscription = await Subscription.findById(
        req.body.subscriptionId
      );
      if (!existingSubscription) {
        return res.status(400).json({ error: 'Subscription not found' });
      }
    }

    // Validate if the provided planHistoryId is a valid MongoDB ID
    if (
      req.body.planHistoryId &&
      !mongoose.Types.ObjectId.isValid(req.body.planHistoryId)
    ) {
      return res.status(400).json({ error: 'Invalid plan history ID' });
    }

    // Check if the plan history with the provided ID exists
    if (req.body.planHistoryId) {
      const existingPlanHistory = await PlanHistory.findById(
        req.body.planHistoryId
      );
      if (!existingPlanHistory) {
        return res.status(404).json({ error: 'Plan history not found' });
      }
    }

    // Update the invoice by ID
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        invoice: updatedInvoice,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};
// Controller method
exports.deleteInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    // Check if the invoice with the provided ID exists
    const existingInvoice = await Invoice.findById(invoiceId);
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete the invoice by ID
    await Invoice.findByIdAndDelete(invoiceId);

    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};

// Controller method
exports.getAllInvoices = async (req, res) => {
  try {
    // Fetch all invoices
    const invoices = await Invoice.find();

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        invoices,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:constants.APIResponseStatus.Error,
      message: req.t('common.InternalServerError'),
    });
  }
};
 
// Add a users in Group
exports.addUsersInGroup = catchAsync(async (req, res, next) => {
  try {
    const { userGroupType, users } = req.body;

    // Validate if userGroupType and users are present in the request
    if (!userGroupType || !users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    // Check if the UserGroupType exists
    const existingUserGroupType = await UserGroupType.findById(userGroupType);
    if (!existingUserGroupType) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Invalid UserGroupType ID',
      });
    }

    // Check if all provided user IDs exist
    const invalidUserIds = [];
    for (const userId of users) {
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        invalidUserIds.push(userId);
      }
    }

    if (invalidUserIds.length > 0) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Invalid user IDs: ' + invalidUserIds.join(', '),
      });
    }

    // Create a new UserInGroup instance with the provided data
    const userInGroup = new UserInGroup({
      userGroup: userGroupType,
      users: users
    });

    // Save the new UserInGroup instance to the database
    await userInGroup.save();

    res.status(201).json({ message: 'Users successfully added to the userGroup' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: req.t('common.InternalServerError') });
  }
});
 
// Update a users in Group
exports.UpdateUsersInGroup = catchAsync(async (req, res, next) => {
  try {
    const userInGroupId = req.params.id;
    const { userGroupType, users } = req.body;

    // Validate if userGroupType and users are present in the request
    if (!userGroupType || !users || !Array.isArray(users)) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    // Check if the UserInGroup instance exists
    const existingUserInGroup = await UserInGroup.findById(userInGroupId);
    if (!existingUserInGroup) {
      return res.status(404).json({
        status:constants.APIResponseStatus.Failure,
        message: 'User Group Details not found',
      });
    }

    // Check if the provided UserGroupType ID exists
    const existingUserGroupType = await UserGroupType.findById(userGroupType);
    if (!existingUserGroupType) {
      return res.status(400).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Invalid UserGroupType ID',
      });
    }

    // Remove users that are in the database but not in the request
    const usersToRemove = existingUserInGroup.users.filter(userId => !users.includes(userId));
    if (usersToRemove.length > 0) {
      existingUserInGroup.users = existingUserInGroup.users.filter(userId => !usersToRemove.includes(userId));
    }

    // Add new users from the request that are not already in the database
    const usersToAdd = users.filter(userId => !existingUserInGroup.users.includes(userId));
    if (usersToAdd.length > 0) {
      existingUserInGroup.users = existingUserInGroup.users.concat(usersToAdd);
    }

    // Update the UserGroupType ID
    existingUserInGroup.userGroup = userGroupType;

    // Save the updated UserInGroup instance to the database
    await existingUserInGroup.save();

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: 'Users in UserGroupType successfully updated',
      data: existingUserInGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: req.t('common.InternalServerError') });
  }
});

// Get a users from Group
exports.getUsersByGroup = catchAsync(async (req, res, next) => {
  try {
    const userInGroupId = req.params.id;

    // Check if the UserInGroup instance exists
    const existingUserInGroup = await UserInGroup.findById(userInGroupId);
    if (!existingUserInGroup) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'User Group Details not found',
      });
    }

    // Fetch user details based on the UserGroupType
    const users = await User.find({ _id: { $in: existingUserInGroup.user } });

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: req.t('common.InternalServerError') });
  }
});

exports.razorpayCredential = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: process.env.RAZORPAY_KEY,
  });
})

exports.updateRazorpaySubscription = async (userAction) => {
  try{
    let companyId = userAction.companyId;
    if (!companyId) {
      const company = await User.findById({ id: userAction.userId.id }).populate('company');
      companyId = company.id;
    }
    const subscription = await Subscription.findOne({
      companyId: companyId,
      "razorpaySubscription.status": { $in: constants.Active_Subscription }
    }).populate('currentPlanId');
    console.log(subscription)
    if (subscription) {
      let update;
      switch(subscription?.currentPlanId?.type){
        case 'fixed':
        // Do nothing for fixed subscription
        break;
        case 'prorata':
        // Logic to handle prorata subscription  
        break;

        case 'max_average':
        // Create an Add-On for new license and update subscription after payment;  
        if (constants.Active_Statuses.includes(userAction.newStatus)) {
          // Update Subscription
          const updateSubscription = await razorpay.subscriptions.update(subscription.subscriptionId, {
            "quantity": subscription.razorpaySubscription.quantity + 1,
            "schedule_change_at": "cycle_end",
          });
          if(updateSubscription){
            await Subscription.findOneAndUpdate(
              {subscriptionId: subscription.subscriptionId},
              {$push: { pendingUpdates: {item: userAction }}}
            );
          }
          console.log('Subscription updated: ', updateSubscription);
          /*
          // Creating AddOns for new license
           const params = {
            item: {
              name: userAction.action,
              amount: subscription.currentPlanId.currentprice * 100,
              currency: 'INR'
            }
          }
          const addon = await razorpay.subscriptions.createAddon(subscription.subscriptionId, params);
          if(addon && subscription.subscriptionId){
            update = await Subscription.findOneAndUpdate({subscriptionId: subscription.subscriptionId}, { $push: { addOns: addon } });
          }
          console.log("Add-on created for subscription: ", companyId, addon, update); */
        } 
        break;

        default: 
        // Do Nothing
        break;
      }
      return update;
    }
    return null;
  } catch(error){
    console.log(error)
    return error;
  }
};

// Verify Payment Status
exports.verifyPayment = catchAsync(async (req, res, next) => {
  try {

    const webhookBody = req.body;
    const razorpaySignature = req.headers['x-razorpay-signature'];

    // Create a hash using your secret and the payload received
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(JSON.stringify(webhookBody))
      .digest('hex');

    // Compare the generated signature with the Razorpay signature sent in the webhook
    if (generatedSignature === razorpaySignature) {
      // Signature is valid, proceed with your logic
      console.log('Webhook signature verified');

      // Handle the subscription payment success or failure
      const event = webhookBody.event;
      const payload = webhookBody.payload;
      console.log(event, webhookBody, payload);

      // Subscriptions other events except activated
      if (event.includes("subscription")) {
        const subscription = payload.subscription;
        const payment = payload.payment;
        let companyId = '';
        // Update Subscription
        if (subscription.entity.id) {
          const sub = await Subscription.findOneAndUpdate(
            { subscriptionId: subscription.entity.id },
            { razorpaySubscription: subscription.entity }
          );
          companyId = sub.companyId;
        }
        // Add Payment Info
        if(event === 'subscription.charged'){
          const existingInvoice = await Invoice.findOne({ "payment_info.id": payment.entity.id });
          if (!existingInvoice) {
            await Invoice.create({
              date: new Date(),
              subscription_id: subscription.entity.id,
              invoice_id: payment.entity.invoice_id,
              isPaid: true,
              amount: payment.entity.amount / 100,
              payment_info: payment.entity,
              companyId:  new mongoose.Types.ObjectId(companyId)
            })
          }
        }
      }
      res.status(200).send(constants.APIResponseStatus.Success);
    } else {
      // Signature mismatch, do not process the event
      console.log('Signature mismatch');
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});