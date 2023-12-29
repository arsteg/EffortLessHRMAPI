
const Software = require('../models/pricing/softwareModel');
const Option = require('../models/pricing/optionModel');
const catchAsync = require('../utils/catchAsync');


exports.createSoftware = catchAsync(async (req, res, next) => {
  const { name,description,accessLink} = req.body;
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
    const softwareExists = await Software.findOne({ name: name});
    if(softwareExists)
    {
      res.status(500).json({
        status: 'failure',
        message: 'Label already in use for another category',
      });
    }
    else{
    const software = await Software.create({ name: name,description: description,accessLink: accessLink });
  
      res.status(201).json({
        status: 'success',
        data: software,
      });
    }
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
  const {name,description,accessLink} = req.body;
const softwareExists = await Software.findOne({ name: req.body.name, description: req.body.description,accessLink: req.body.accessLink,  _id: { $ne: req.params.id }});
if(softwareExists)
{
    res.status(500).json({
    status: 'failure',
    message: 'Label already in use for another category',
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
const software = await Software.find({}).where('company').equals(req.cookies.companyId);
res.status(200).json({
  status: 'success',
  data: software,
});
});

exports.createOption = catchAsync(async (req, res, next) => {
  const { name} = req.body;
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
    const optionExists = await Software.findOne({ name: name});
    if(optionExists)
    {
      res.status(500).json({
        status: 'failure',
        message: 'Label already in use for another category',
      });
    }
    else{
    const option = await Option.create({ name: name });
  
      res.status(201).json({
        status: 'success',
        data: option,
      });
    }
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
    message: 'Label already in use for another category',
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
const option = await Option.find({}).where('company').equals(req.cookies.companyId);
res.status(200).json({
  status: 'success',
  data: option,
});
});