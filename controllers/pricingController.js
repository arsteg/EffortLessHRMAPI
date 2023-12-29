
const Software = require('../models/pricing/softwareModel');
const Option = require('../models/pricing/optionModel');
const Plan = require('../models/pricing/planModel');
const OptionIncluded = require('../models/pricing/optionIncludedModel');
const Offer = require('../models/pricing/offerModel');
const Include = require('../models/pricing/includeModel');
const UserGroupType = require('../models/pricing/userGroupTypeModel');
const catchAsync = require('../utils/catchAsync');

exports.createSoftware = catchAsync(async (req, res, next) => {
  const { name,description,accessLink} = req.body;
    const softwareExists = await Software.findOne({ name: name});
    if(softwareExists)
    {
      res.status(500).json({
        status: 'failure',
        message: 'Label already in use for another software',
      });
    }
    else{
    const software = await Software.create({ name: name,description: description,accessLink: accessLink });
  
      res.status(201).json({
        status: 'success',
        data: software,
      });
    }

});  

exports.getSoftware = catchAsync(async (req, res, next) => {
const software = await Software.findById(req.params.id);
res.status(200).json({
  status: 'success',
  data: software,
});
});

exports.updateSoftware = catchAsync(async (req, res, next) => {
const softwareExists = await Software.findOne({ name: req.body.name, description: req.body.description,accessLink: req.body.accessLink,  _id: { $ne: req.params.id }});
if(softwareExists)
{
    res.status(500).json({
    status: 'failure',
    message: 'Label already in use for another software',
  });
}
else
{
    const software = await Software.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

    res.status(200).json({
      status: 'success',
      data: software,
    });
}
});

exports.deleteSoftware = catchAsync(async (req, res, next) => {

const softwareInstance = await Software.findById(req.params.id);
await softwareInstance.remove();
if (!softwareInstance) {
  return next(new AppError('Expense category not found', 404));
}

return res.status(204).json({
  status: 'success',
  data: null,
});
});

exports.getAllSoftware = catchAsync(async (req, res, next) => {
const software = await Software.find({});
res.status(200).json({
  status: 'success',
  data: software,
});
});

exports.createOption = catchAsync(async (req, res, next) => {
  const { name} = req.body; 
    const optionExists = await Software.findOne({ name: name});
    if(optionExists)
    {
      res.status(500).json({
        status: 'failure',
        message: 'Label already in use for another option',
      });
    }
    else{
    const option = await Option.create({ name: name });
  
      res.status(201).json({
        status: 'success',
        data: option,
      });
    }
});  

exports.getOption = catchAsync(async (req, res, next) => {
const option = await Option.findById(req.params.id);
res.status(200).json({
  status: 'success',
  data: option,
});
});

exports.updateOption = catchAsync(async (req, res, next) => {
  const {name} = req.body;
const optionExists = await Option.findOne({ name: req.body.name,  _id: { $ne: req.params.id }});
if(optionExists)
{
    res.status(500).json({
    status: 'failure',
    message: 'Label already in use for another option',
  });
}
else
{
    const option = await Option.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

    res.status(200).json({
      status: 'success',
      data: option,
    });
}
});

exports.deleteOption = catchAsync(async (req, res, next) => {

const optionInstance = await Option.findById(req.params.id);
await optionInstance.remove();
if (!optionInstance) {
  return next(new AppError('Expense category not found', 404));
}

return res.status(204).json({
  status: 'success',
  data: null,
});
});

exports.getAllOption = catchAsync(async (req, res, next) => {
const option = await Option.find({});
res.status(200).json({
  status: 'success',
  data: option,
});
});

exports.createPlan = catchAsync(async (req, res, next) => {
  const { name,software,currentprice,IsActive} = req.body; 
    const planExists = await Software.findOne({ name: name,software: software});
    if(planExists)
    {
      res.status(500).json({
        status: 'failure',
        message: 'Label already in use for another Plan',
      });
    }
    else{
    const plan = await Plan.create({ name: name,software: software,currentprice: currentprice,IsActive: IsActive });
  
      res.status(201).json({
        status: 'success',
        data: plan,
      });
    }
});  

exports.getPlan = catchAsync(async (req, res, next) => {
const plan = await Plan.findById(req.params.id);
if(plan) {
    const softwares = await Software.find({})
      .where('_id').equals(plan.software);
console.log(softwares);
    if(softwares && softwares.length) {
      plan.softwares = softwares;
    } else {
      plan.softwares = null;
    }
  
}
res.status(200).json({
  status: 'success',
  data: plan,
});
});

exports.updatePlan = catchAsync(async (req, res, next) => {
 
const planExists = await Plan.findOne({ name: req.body.name,software: req.body.software ,_id: { $ne: req.params.id }});
if(planExists)
{
    res.status(500).json({
    status: 'failure',
    message: 'Name already in use for Same Software',
  });
}
else
{
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

    res.status(200).json({
      status: 'success',
      data: plan,
    });
}
});

exports.deletePlan = catchAsync(async (req, res, next) => {
const planInstance = await Plan.findById(req.params.id);
await planInstance.remove();
if (!planInstance) {
  return next(new AppError('Expense category not found', 404));
}

return res.status(204).json({
  status: 'success',
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
  status: 'success',
  data: plan,
});
});

// Add an option to a plan
exports.addOptionToPlan = async (req, res, next) => {
  try {
    const { plan, option, dateAdded, dateRemoved } = req.body;

    // Check if the plan and option exist
    const existingPlan = await Plan.findById(plan);
    const existingOption = await Option.findById(option);

    if (!existingPlan || !existingOption) {
      return res.status(400).json({
        status: 'failure',
        message: 'Invalid plan or option ID',
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
      status: 'success',
      data: optionIncluded,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Remove an option from a plan
exports.removeOptionFromPlan = async (req, res, next) => {
  try {
    const optionIncludedId = req.params.id;

    // Check if the OptionIncluded entry exists
    const optionIncluded = await OptionIncluded.findById(optionIncludedId);

    if (!optionIncluded) {
      return res.status(404).json({
        status: 'failure',
        message: 'Option Inclusion Details not found',
      });
    }

    // Delete OptionIncluded entry
    await OptionIncluded.findByIdAndDelete(optionIncludedId);

    res.status(204).json({
      status: 'success',
      message: 'Option successfully removed from the plan',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
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
        status: 'failure',
        message: 'Option Inclusion Details not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: optionIncluded,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Implementation for getAllOptionInclusionDetails
exports.getAllOptionInclusionDetails = catchAsync(async (req, res, next) => {
  const optionInclusionDetails = await OptionIncluded.find();

  res.status(200).json({
    status: 'success',
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
    return next(new AppError('Option Inclusion Details not found', 404));
  }

  res.status(200).json({
    status: 'success',
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
      status: 'success',
      data: offer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
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
        status: 'failure',
        message: 'Offer Inclusion Details not found',
      });
    }

    // Delete Offer entry
    await Offer.findByIdAndDelete(offerId);

    res.status(204).json({
      status: 'success',
      message: 'Offer successfully removed',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
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
        status: 'failure',
        message: 'Offer Inclusion Details not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: offer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Implementation for getAllOfferDetails
exports.getAllOfferDetails = catchAsync(async (req, res, next) => {
  const offerDetails = await Offer.find();

  res.status(200).json({
    status: 'success',
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
    return next(new AppError('Offer Inclusion Details not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: offer,
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
      status: 'failure',
      message: 'Invalid plan or offer ID',
    });
  }

  // Create Include entry
  const include = await Include.create({
    plan,
    offer,
  });

  res.status(201).json({
    status: 'success',
    data: include,
  });
});

// Remove a plan from an offer
exports.removePlanFromOffer = catchAsync(async (req, res, next) => {
  const includeId = req.params.id;

  // Check if the Include entry exists
  const include = await Include.findById(includeId);

  if (!include) {
    return res.status(404).json({
      status: 'failure',
      message: 'Include Details not found',
    });
  }

  // Delete Include entry
  await Include.findByIdAndDelete(includeId);

  res.status(204).json({
    status: 'success',
    message: 'Plan successfully removed from the offer',
  });
});

// Get Include Details by ID
exports.getIncludeDetails = catchAsync(async (req, res, next) => {
  const includeId = req.params.id;

  // Find Include entry by ID
  const include = await Include.findById(includeId);

  if (!include) {
    return res.status(404).json({
      status: 'failure',
      message: 'Include Details not found',
    });
  }

  res.status(200).json({
    status: 'success',
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
      status: 'failure',
      message: 'Include Details not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: include,
  });
});

// Get all include details
exports.getAllIncludeDetails = catchAsync(async (req, res, next) => {
  const includeDetails = await Include.find();

  res.status(200).json({
    status: 'success',
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
        status: 'failure',
        message: 'Name already in use for another UserGroup',
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
      status: 'success',
      data: userGroupType,
    });
  }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
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
        status: 'failure',
        message: 'User Group Type not found',
      });
    }

    res.status(204).json({
      status: 'success',
      message: 'User group type successfully removed',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
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
        status: 'failure',
        message: 'User Group Type not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: userGroupType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
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
      status: 'failure',
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
          status: 'failure',
          message: 'User Group Type not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: userGroupType,
      });
    }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
};

// Get all user group types
exports.getAllUserGroupTypes = async (req, res, next) => {
  try {
    const userGroupTypes = await UserGroupType.find();

    res.status(200).json({
      status: 'success',
      data: userGroupTypes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
