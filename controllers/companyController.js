const Company = require('../models/companyModel');
const Role = require('../models/permissions/roleModel');
const catchAsync = require('../utils/catchAsync');
const HolidayCalendar = require('../models/Company/holidayCalendar');
const HolidayapplicableEmployee = require('../models/Company/HolidayApplicableEmployee');
const Zone = require('../models/Company/Zone');
const Location = require('../models/Company/Location');
const AppError = require('../utils/appError');
const Department = require("../models/Company/Deparment");
const SubDepartment = require('../models/Company/SubDepartment');
const Designation = require("../models/Company/Designation");
const Band = require("../models/Company/Band");
const Signatory = require("../models/Company/Signatory");
const TaxSlab = require('../models/Company/TaxSlab');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');
const StorageController = require('./storageController');

exports.getAllCompanies = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllCompanies', constants.LOG_TYPES.INFO);
  const companies = await Company.find();
  websocketHandler.sendLog(req, `Retrieved ${companies.length} companies`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: companies
  });
});

exports.deleteCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteCompany', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting company with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const document = await Company.findByIdAndDelete(req.params.id);
  if (!document) {
    websocketHandler.sendLog(req, `Company not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.notFound'), 404));
  }
  websocketHandler.sendLog(req, `Company deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.updateCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateCompany', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating company with ID: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  // ✅ Check if state is missing or empty
  if (!req.body.state || req.body.state.trim() === '') {
    websocketHandler.sendLog(req, 'State value missing in update request', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.stateNotFound'), 404)); // You can add this key in i18n if not already there
  }
  const document = await Company.findByIdAndUpdate(req.cookies.companyId, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!document) {
    websocketHandler.sendLog(req, `Company not found: ${req.cookies.companyId}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.notFound'), 404));
  }
  websocketHandler.sendLog(req, `Company updated: ${document._id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: {
      data: document
    }
  });
});
exports.updateCompanyLogo = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, `Updating Company Logo for company ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);

  const company = await Company.findById(req.cookies.companyId);
  if (!company) {
    websocketHandler.sendLog(req, `Company ${req.cookies.companyId} not found`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('company.notFound')

      , 404));
  }

  for (let i = 0; i < req.body.companyLogo.length; i++) {
    if (!req.body.companyLogo[i].attachmentSize || !req.body.companyLogo[i].extention || !req.body.companyLogo[i].file ||
      req.body.companyLogo[i].attachmentSize === null || req.body.companyLogo[i].extention === null || req.body.companyLogo[i].file === null) {
      websocketHandler.sendLog(req, 'Missing company logo properties', constants.LOG_TYPES.WARN);
      return res.status(400).json({
        error: req.t('company.missingcompanyLogoProperties')

      });
    }

    let extension = req.body.companyLogo[i].extention.toLowerCase();
    if (!extension.startsWith('.')) {
      extension = `.${extension}`; // Add leading dot if missing
    }

    const attachmentName = company.companyName;
    //req.body.companyLogo[i].filePath = attachmentName + "_" + company._id + req.body.companyLogo[i].extention;
    req.body.companyLogo[i].filePath = `${attachmentName}_${company._id}_${i}${extension}`;
    websocketHandler.sendLog(req, `Uploading Company Logo ${req.body.companyLogo[i].filePath}`, constants.LOG_TYPES.DEBUG);

    const url = await StorageController.createContainerInContainerSAS(
      req.cookies.companyId,
      constants.SubContainers.Company,
      req.body.companyLogo[i]
    );

    company.logo = url;
    await company.save();
    websocketHandler.sendLog(req, `Company Logo updated with URL ${url}`, constants.LOG_TYPES.INFO);
  }

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: company
  });
});
exports.getCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getCompany', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching company with ID: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const company = await Company.findById(req.cookies.companyId);
  websocketHandler.sendLog(req, `Company retrieved: ${company?._id || 'none'}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      company: company
    }
  });
});
// Get Country List
exports.getCompanyList = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getCompanyList', constants.LOG_TYPES.INFO);
  const companyList = await Company.find({}).all();
  websocketHandler.sendLog(req, `Retrieved ${companyList.length} companies`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: {
      companyList: companyList
    }
  });
});
// exports.createHoliday = catchAsync(async (req, res, next) => {
//   websocketHandler.sendLog(req, 'Starting createHoliday', constants.LOG_TYPES.INFO);
//   const company = req.cookies.companyId; // Get company from cookies
//   const holidayDate = req.body.date;
//   // Validate if company value exists in cookies
//   if (!company) {
//     websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
//     return next(new AppError(req.t('company.companyIdMissing'), 400));
//   }
//   req.body.company = company; // Set company in the request body
//   websocketHandler.sendLog(req, `Creating holiday for company: ${company}`, constants.LOG_TYPES.TRACE);
//   if (!holidayDate) {
//     websocketHandler.sendLog(req, 'Holiday date missing in request body', constants.LOG_TYPES.ERROR);
//     return next(new AppError(req.t('common.dateMissing'), 400));
//   }

//   // ✅ Check for existing holiday on the same date
//   const existingHoliday = await HolidayCalendar.findOne({
//     company,
//     date: new Date(holidayDate),
//   });

//   if (existingHoliday) {
//     websocketHandler.sendLog(req, `Holiday already exists on ${holidayDate} for company ${company}`, constants.LOG_TYPES.ERROR);
//     return next(new AppError(req.t('common.duplicateDate'), 400)); // i18n: 'Holiday already exists on this date'
//   }
//   const holidayCalendar = await HolidayCalendar.create(req.body);
//   const users = req.body.users;

//   // Iterate through the users array and add unique user IDs to uniqueUsers array
//   const uniqueUsers = new Set(); // Using a Set to store unique user IDs

//   // Iterate through the users array and add unique user IDs to uniqueUsers set
//   for (const val of users) {
//     const userId = val.user; // Get the user ID from the object
//     if (!uniqueUsers.has(userId)) { // Check if user ID already exists
//       uniqueUsers.add(userId);
//     }
//   }
//   // Iterate through the users array and create UserRegularizationReason for each user
//   const holidayapplicableEmployees = [];
//   for (const user of uniqueUsers) {
//     const holidayapplicableEmployee = await HolidayapplicableEmployee.create({
//       user: user,
//       holiday: holidayCalendar._id // Assuming regularizationReason is the newly created document
//     });
//     holidayapplicableEmployees.push(holidayapplicableEmployee);
//   }
//   holidayCalendar.holidayapplicableEmployee = holidayapplicableEmployees;
//   websocketHandler.sendLog(req, `Holiday created: ${holidayCalendar._id} with ${holidayapplicableEmployees.length} applicable employees`, constants.LOG_TYPES.INFO);
//   res.status(201).json({
//     status: constants.APIResponseStatus.Success,
//     data: holidayCalendar
//   });
// });
exports.createHoliday = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createHoliday', constants.LOG_TYPES.INFO);
  const company = req.cookies.companyId; // Get company from cookies
  const holidayDate = req.body.date;
  const holidayName = req.body.label; // Assuming the name/description is in req.body.name
  const isRecurring = req.body.isHolidayOccurEveryYearOnSameDay; // Assuming this flag is in req.body

  // 1. Validate if company value exists in cookies
  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.companyIdMissing'), 400));
  }
  req.body.company = company; // Set company in the request body
  websocketHandler.sendLog(req, `Creating holiday for company: ${company}`, constants.LOG_TYPES.TRACE);
  if (!holidayDate) {
    websocketHandler.sendLog(req, 'Holiday date missing in request body', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.dateMissing'), 400));
  }
  if (!holidayName) {
    websocketHandler.sendLog(req, 'Holiday name missing in request body', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('holiday.nameMissing'), 400)); // Add appropriate i18n
  }

  const dateObj = new Date(holidayDate);
  const year = dateObj.getFullYear();

  // 2. ✅ Check for existing holiday on the exact same date
  const existingHolidayOnDate = await HolidayCalendar.findOne({
    company,
    date: dateObj,
  });

  if (existingHolidayOnDate) {
    websocketHandler.sendLog(req, `Holiday already exists on ${holidayDate} for company ${company}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.duplicateDate'), 400)); // i18n: 'Holiday already exists on this date'
  }
  
  // 3. 🚨 NEW: Check for duplicate holiday in the same year if it's NOT a recurring holiday
  if (isRecurring === false || isRecurring === 'false' || isRecurring === true || isRecurring === 'true') {
    // Get the start and end of the specified year
    const startOfYear = new Date(year, 0, 1); // January 1st of the year
    const endOfYear = new Date(year, 11, 31, 23, 59, 59); // December 31st of the year

    const existingHolidayInYear = await HolidayCalendar.findOne({
      company,
      label: holidayName,
      date: {
        $gte: startOfYear, // Date is greater than or equal to start of year
        $lte: endOfYear    // Date is less than or equal to end of year
      }
    });
    if (existingHolidayInYear) {
      websocketHandler.sendLog(req, `Duplicate holiday name found in ${year} for company ${company}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.duplicateHolidayInYear'), 400)); // i18n: 'This holiday already exists in the current year.'
    }
  }

  // --- Execution continues if checks pass ---
  const holidayCalendar = await HolidayCalendar.create(req.body);
  const users = req.body.users || []; // Handle case where users might be missing or null

  // Iterate through the users array and add unique user IDs to uniqueUsers set
  const uniqueUsers = new Set(users.map(val => val.user));

  // Iterate through the unique user IDs and create HolidayapplicableEmployee for each
  const holidayapplicableEmployees = [];
  for (const user of uniqueUsers) {
    const holidayapplicableEmployee = await HolidayapplicableEmployee.create({
      user: user,
      holiday: holidayCalendar._id
    });
    holidayapplicableEmployees.push(holidayapplicableEmployee);
  }

  holidayCalendar.holidayapplicableEmployee = holidayapplicableEmployees;
  websocketHandler.sendLog(req, `Holiday created: ${holidayCalendar._id} with ${holidayapplicableEmployees.length} applicable employees`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendar
  });
});
exports.getHoliday = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getHoliday', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching holiday with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const holidayCalendar = await HolidayCalendar.findById(req.params.id);

  if (!holidayCalendar) {
    websocketHandler.sendLog(req, `Holiday not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.holidayNotFound'), 404));
  }
  if (holidayCalendar) {


    const holidayapplicableEmployees = await HolidayapplicableEmployee.find({}).where('holiday').equals(holidayCalendar._id);
    if (holidayapplicableEmployees) {
      holidayCalendar.holidayapplicableEmployee = holidayapplicableEmployees;
    }
    else {
      holidayCalendar.holidayapplicableEmployee = null;
    }

  }
  websocketHandler.sendLog(req, `Holiday retrieved: ${holidayCalendar._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendar
  });
});

exports.updateHoliday = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateHoliday', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating holiday with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const isHolidayCalendar = await HolidayCalendar.findById(req.params.id);

  if (!isHolidayCalendar) {
    websocketHandler.sendLog(req, `Holiday not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.holidayNotFound'), 404));
  }
  const company = req.cookies.companyId; // Get company from cookies
  const holidayDate = req.body.date;
  // Validate if company value exists in cookies
  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.companyIdMissing'), 400));
  }
  const existingHoliday = await HolidayCalendar.findOne({
    _id: { $ne: req.params.id },
    company,
    date: new Date(holidayDate),
  });
  if (existingHoliday) {
    websocketHandler.sendLog(req, `Holiday already exists on ${holidayDate} for company ${company}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('common.duplicateDate'), 400)); // i18n: 'Holiday already exists on this date'
  }
  // Extract the user IDs from the request body
  const { users: allUsers } = req.body;

  // Iterate through the users array and add unique user IDs to newUsers Set
  const newUsers = new Set();
  for (const val of allUsers) {
    const userId = val.user; // Get the user ID from the object
    newUsers.add(userId);
  }
  // Retrieve the existing users associated with the regularization reason
  const existingUsers = await HolidayapplicableEmployee.find({ holiday: isHolidayCalendar._id });

  // Extract the existing user IDs
  const existingUserIds = existingUsers.map(user => user.user.toString());

  // Find users to be removed (existing users not present in the request)
  const usersToRemove = existingUsers.filter(user => !newUsers.has(user.user.toString()));

  // Remove the users to be removed
  await Promise.all(usersToRemove.map(async user => await user.remove()));

  // Find new users to be added (users in the request not already associated)
  const newUsersToAdd = Array.from(newUsers).filter(userId => !existingUserIds.includes(userId));

  // Add new users
  const holidayapplicableEmployees = await Promise.all(newUsersToAdd.map(async userId => {
    return await HolidayapplicableEmployee.create({
      user: userId,
      holiday: isHolidayCalendar._id
    });
  }));

  const holidayCalendar = await HolidayCalendar.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!holidayCalendar) {
    websocketHandler.sendLog(req, `Holiday not found after update: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.holidayNotFound'), 404));
  }

  holidayCalendar.holidayapplicableEmployee = await HolidayapplicableEmployee.find({}).where('holiday').equals(holidayCalendar._id);;
  websocketHandler.sendLog(req, `Holiday updated: ${holidayCalendar._id} with ${holidayCalendar.holidayapplicableEmployee.length} applicable employees`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendar
  });
});


exports.deleteHoliday = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteHoliday', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting holiday with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const holidayCalendar = await HolidayCalendar.findById(req.params.id);

  if (!holidayCalendar) {
    websocketHandler.sendLog(req, `Holiday not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.holidayNotFound'), 404));
  }

  // ✅ Validate that the holiday is not in the past
  const today = new Date();
  const holidayDate = new Date(holidayCalendar.date);

  // Strip time from today's date for accurate comparison
  today.setHours(0, 0, 0, 0);
  holidayDate.setHours(0, 0, 0, 0);

  if (holidayDate < today) {
    websocketHandler.sendLog(req, `Attempted to delete past holiday: ${holidayCalendar.date}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('common.pastHolidayDeleteNotAllowed') || 'Cannot delete past holidays.', 400));
  }

  await HolidayCalendar.findByIdAndDelete(req.params.id);
  websocketHandler.sendLog(req, `Holiday deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});


exports.getAllHolidaysByYear = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllHolidaysByYear', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching holidays for company: ${req.cookies.companyId}, years: ${req.body.years}`, constants.LOG_TYPES.TRACE);
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const year = req.body.year || null;
  console.log(year);
  //const totalCount = await HolidayCalendar.countDocuments({  company: req.cookies.companyId, status : req.body.status });     

  const query = {
    company: req.cookies.companyId,
    status: req.body.status
  };

  // // If years are provided, add them to the query
  // if (years && years.length > 0) {
  //   query.year = { $in: years };
  // }
  // If years are provided, add them to the query
  if (year) {
    const startDate = new Date(year, 0, 1); // Jan 1 of the year
    const endDate = new Date(year, 11, 31, 23, 59, 59); // Dec 31 end of day

    query.date = {
      $gte: startDate,
      $lte: endDate
    };
  }

  // Get the total count of documents that match the query
  const totalCount = await HolidayCalendar.countDocuments(query);

  // Fetch the holiday calendars that match the query with pagination
  const holidayCalendars = await HolidayCalendar.find(query).skip(skip).limit(limit);

  //const holidayCalendars = await HolidayCalendar.find({}).where('status').equals(req.body.status).where('company').equals(req.cookies.companyId).where('year').equals(req.params.year).skip(parseInt(skip)).limit(parseInt(limit));

  if (holidayCalendars) {
    for (var i = 0; i < holidayCalendars.length; i++) {
      const holidayapplicableEmployee = await HolidayapplicableEmployee.find({}).where('holiday').equals(holidayCalendars[i]._id);
      if (holidayapplicableEmployee) {
        holidayCalendars[i].holidayapplicableEmployee = holidayapplicableEmployee;
      }
      else {
        holidayCalendars[i].holidayapplicableEmployee = null;
      }
    }
  }
  websocketHandler.sendLog(req, `Retrieved ${holidayCalendars.length} holidays, total: ${totalCount}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendars,
    total: totalCount
  });
});

exports.createZone = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createZone', constants.LOG_TYPES.INFO);
  try {
    const company = req.cookies.companyId; 
    if (!company) {
      websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.companyIdMissing'), 400));
    }

    const { zoneName } = req.body;
    const existingShift = await Zone.findOne({ zoneName: zoneName, company: company, isDelete: { $ne: true } });

    if (existingShift) {
      websocketHandler.sendLog(req, `Zone with name "${name}" already exists for company ${company}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.duplicate_zone_record'), 400));
    }

    req.body.company = company;
    websocketHandler.sendLog(req, `Creating zone for company: ${company}`, constants.LOG_TYPES.TRACE);

    const zone = await Zone.create(req.body);
    websocketHandler.sendLog(req, `Zone created: ${zone._id}`, constants.LOG_TYPES.INFO);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: zone
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error creating zone: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.duplicate_zone_record'), 400));
  }
};

exports.getZone = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getZone', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching zone with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      websocketHandler.sendLog(req, `Zone not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('company.zoneNotFound')
      });
    }
    websocketHandler.sendLog(req, `Zone retrieved: ${zone._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: zone
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error fetching zone: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

exports.updateZone = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateZone', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating zone with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!zone) {
      websocketHandler.sendLog(req, `Zone not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);

      return next(new AppError(req.t('company.zoneNotFound'), 400));
    }
    websocketHandler.sendLog(req, `Zone updated: ${zone._id}`, constants.LOG_TYPES.INFO);

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: zone
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error updating zone: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

exports.getZonesByCompanyId = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getZonesByCompanyId', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching zones for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  try {
    const zones = await Zone.find({ company: req.cookies.companyId });
    websocketHandler.sendLog(req, `Retrieved ${zones.length} zones`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: zones
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error fetching zones: ${error.message}`, constants.LOG_TYPES.ERROR);
    next(error);
  }
};

exports.deleteZone = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteZone', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting zone with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) {
      websocketHandler.sendLog(req, `Zone not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.zoneNotFound'), 400));
    }
    websocketHandler.sendLog(req, `Zone deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error deleting zone: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};
// Add a Location
exports.addLocation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting addLocation', constants.LOG_TYPES.INFO);
  const company = req.cookies.companyId; // Get company from cookies

  // Validate if company value exists in cookies
  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.companyIdMissing'), 400));
  }
  req.body.company = company; // Set company in the request body
  websocketHandler.sendLog(req, `Adding location for company: ${company}`, constants.LOG_TYPES.TRACE);
  const { locationCode } = req.body;
  const existing = await Location.findOne({ locationCode: locationCode, company });

  if (existing) {
    websocketHandler.sendLog(req, `Location already exists: ${locationCode}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('company.locationExists'), 400));
  }
  const location = await Location.create(req.body);
  websocketHandler.sendLog(req, `Location created: ${location._id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: location
  });
});

// Get a Location
exports.getLocation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getLocation', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching location with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const location = await Location.findById(req.params.id);
  if (!location) {
    websocketHandler.sendLog(req, `Location not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.locationNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Location retrieved: ${location._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: location
  });
});

// Update a Location
exports.updateLocation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateLocation', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating location with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const company = req.cookies.companyId; // Get company from cookies

  // Validate if company value exists in cookies
  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.companyIdMissing'), 400));
  }
  req.body.company = company; // Set company in the request body
  const { locationCode } = req.body;
  const existing = await Location.findOne({ _id: { $ne: req.params.id }, locationCode: locationCode, company });

  if (existing) {
    websocketHandler.sendLog(req, `Location already exists: ${locationCode}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('company.locationExists'), 400));
  }
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!location) {
    websocketHandler.sendLog(req, `Location not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.locationNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Location updated: ${location._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: location
  });
});

// Get All Locations by companyId
exports.getAllLocationsByCompanyId = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllLocationsByCompanyId', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching locations for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const locations = await Location.find({ company: req.cookies.companyId });
  websocketHandler.sendLog(req, `Retrieved ${locations.length} locations`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: locations
  });
});

// Delete a Location
exports.deleteLocation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteLocation', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting location with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const location = await Location.findByIdAndDelete(req.params.id);
  if (!location) {
    websocketHandler.sendLog(req, `Location not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.locationNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Location deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Add a Department
exports.createDepartment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createDepartment', constants.LOG_TYPES.INFO);
  const company = req.cookies.companyId; // Get company from cookies

  // Validate if company value exists in cookies
  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.companyIdMissing'), 400));
  }
  const { departmentName, departmentCode } = req.body;
  const existing = await Department.findOne({
    company, // Match within the same company
    $or: [
      { departmentName: { $regex: `^${departmentName}$`, $options: 'i' } },
      { departmentCode: { $regex: `^${departmentCode}$`, $options: 'i' } }
    ]
  });
  if (existing) {
    websocketHandler.sendLog(req, `Duplicate department found: Name "${departmentName}", Code "${departmentCode}"`, constants.LOG_TYPES.WARN);

    return next(new AppError(req.t('company.departmentExists'), 400));

  }
  req.body.company = company; // Set company in the request body
  websocketHandler.sendLog(req, `Creating department for company: ${company}`, constants.LOG_TYPES.TRACE);

  const department = await Department.create({ departmentName, departmentCode, company });
  websocketHandler.sendLog(req, `Department created: ${department._id}`, constants.LOG_TYPES.INFO);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: department
  });
});

// Get a Department
exports.getDepartment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getDepartment', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching department with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const department = await Department.findById(req.params.id);
  if (!department) {
    websocketHandler.sendLog(req, `Department not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.departmentNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Department retrieved: ${department._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: department
  });
});

// Update a Department
exports.updateDepartment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateDepartment', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating department with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const { departmentName, departmentCode } = req.body;
  const company = req.cookies.companyId; // Get company from cookies

  // Validate if company value exists in cookies
  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.companyIdMissing'), 400));
  }
  const existing = await Department.findOne({
    _id: { $ne: req.params.id },
    company, // Match within the same company
    $or: [
      { departmentName: { $regex: `^${departmentName}$`, $options: 'i' } },
      { departmentCode: { $regex: `^${departmentCode}$`, $options: 'i' } }
    ]
  });
  if (existing) {
    websocketHandler.sendLog(req, `Duplicate department found: Name "${departmentName}", Code "${departmentCode}"`, constants.LOG_TYPES.WARN);

    return next(new AppError(req.t('company.departmentExists'), 400));

  }
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!department) {
    websocketHandler.sendLog(req, `Department not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.departmentNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Department updated: ${department._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: department
  });
});

// Get All Departments by CompanyId
exports.getAllDepartmentsByCompanyId = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllDepartmentsByCompanyId', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching departments for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const departments = await Department.find({}).where('company').equals(req.cookies.companyId);
  websocketHandler.sendLog(req, `Retrieved ${departments.length} departments`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: departments
  });
});

// Delete Department
exports.deleteDepartment = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteDepartment', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting department with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    websocketHandler.sendLog(req, `Department not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.departmentNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Department deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// controllers/companyController.js

exports.createSubDepartment = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createSubDepartment', constants.LOG_TYPES.INFO);

  try {
    const company = req.cookies.companyId;

    if (!company) {
      websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.companyIdMissing'), 400));
    }

    const { subDepartmentName, subDepartmentCode } = req.body;
    req.body.company = company;

    // ✅ Check for duplicate based on name + code + company
    const existing = await SubDepartment.findOne({
      company, // Match within the same company
      $or: [
        { subDepartmentName: { $regex: `^${subDepartmentName}$`, $options: 'i' } },
        { subDepartmentCode: { $regex: `^${subDepartmentCode}$`, $options: 'i' } }
      ]
    });

    if (existing) {
      websocketHandler.sendLog(
        req,
        `Sub-department already exists: Name "${subDepartmentName}", Code "${subDepartmentCode}"`,
        constants.LOG_TYPES.WARN
      );
      return next(new AppError(req.t('company.subDepartmentExists'), 400));
    }

    const subDepartment = await SubDepartment.create(req.body);
    websocketHandler.sendLog(req, `Sub-department created: ${subDepartment._id}`, constants.LOG_TYPES.INFO);

    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: subDepartment
    });

  } catch (err) {
    websocketHandler.sendLog(req, `Error creating sub-department: ${err.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};


exports.getSubDepartment = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getSubDepartment', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching sub-department with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const subDepartment = await SubDepartment.findById(req.params.id);
    if (!subDepartment) {
      websocketHandler.sendLog(req, `Sub-department not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('company.subDepartmentNotFound')
      });
    } else {
      websocketHandler.sendLog(req, `Sub-department retrieved: ${subDepartment._id}`, constants.LOG_TYPES.INFO);
      res.status(200).json({
        status: constants.APIResponseStatus.Success,
        data: subDepartment
      });
    }
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching sub-department: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.serverError')
    });
  }
};

exports.updateSubDepartment = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateSubDepartment', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating sub-department with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  try {
    const company = req.cookies.companyId;

    if (!company) {
      websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.companyIdMissing'), 400));

    }

    const { subDepartmentName, subDepartmentCode } = req.body;

    // ✅ Check if another sub-department with same name & code exists (excluding current one)

    const existing = await SubDepartment.findOne({
      _id: { $ne: req.params.id },
      company, // Match within the same company
      $or: [
        { subDepartmentName: { $regex: `^${subDepartmentName}$`, $options: 'i' } },
        { subDepartmentCode: { $regex: `^${subDepartmentCode}$`, $options: 'i' } }
      ]
    });
    if (existing) {
      websocketHandler.sendLog(req, `Duplicate sub-department found: Name "${subDepartmentName}", Code "${subDepartmentCode}"`, constants.LOG_TYPES.WARN);

      return next(new AppError(req.t('company.subDepartmentExists'), 400));

    }

    // ✅ Proceed with update
    const subDepartment = await SubDepartment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!subDepartment) {
      websocketHandler.sendLog(req, `Sub-department not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.subDepartmentNotFound'), 400));
    }

    websocketHandler.sendLog(req, `Sub-department updated: ${subDepartment._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: subDepartment
    });

  } catch (err) {
    websocketHandler.sendLog(req, `Error updating sub-department: ${err.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

exports.getAllSubDepartmentsByCompanyId = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllSubDepartmentsByCompanyId', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching sub-departments for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  try {
    const subDepartments = await SubDepartment.find({}).where('company').equals(req.cookies.companyId);
    websocketHandler.sendLog(req, `Retrieved ${subDepartments.length} sub-departments`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: subDepartments
    });
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching sub-departments: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.serverError')
    });
  }
};

exports.deleteSubDepartment = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteSubDepartment', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting sub-department with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const subDepartment = await SubDepartment.findByIdAndDelete(req.params.id);
    if (!subDepartment) {
      websocketHandler.sendLog(req, `Sub-department not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('company.subDepartmentNotFound')
      });
    } else {
      websocketHandler.sendLog(req, `Sub-department deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
      res.status(204).json({
        status: constants.APIResponseStatus.Success,
        data: null
      });
    }
  } catch (err) {
    websocketHandler.sendLog(req, `Error deleting sub-department: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.serverError')
    });
  }
};
exports.createDesignation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createDesignation', constants.LOG_TYPES.INFO);
  const company = req.cookies.companyId;

  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.companyIdMissing'),
    });
  }

  const { designation } = req.body;
  req.body.company = company;

  websocketHandler.sendLog(req, `Checking for existing designation: ${designation}`, constants.LOG_TYPES.TRACE);

  // ✅ Check if designation with same name already exists for the company
  const existing = await Designation.findOne({ designation: designation, company });

  if (existing) {
    websocketHandler.sendLog(req, `Designation already exists: ${designation}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('company.designationExists'), 400));
  }

  // Proceed to create
  const designationCreated = await Designation.create(req.body);
  websocketHandler.sendLog(req, `Designation created: ${designation._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: designationCreated
  });
});


exports.getDesignation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getDesignation', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching designation with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const designation = await Designation.findById(req.params.id);
  if (!designation) {
    websocketHandler.sendLog(req, `Designation not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.designationNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Designation retrieved: ${designation._id}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: designation
  });
});
exports.updateDesignation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateDesignation', constants.LOG_TYPES.INFO);
  const { designation } = req.body;
  const company = req.cookies.companyId;

  if (!company) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.companyIdMissing'),
    });
  }

  // ✅ Check for duplicate designation name in the same company, excluding the current one
  const existing = await Designation.findOne({
    designation: { $regex: `^${designation}$`, $options: 'i' },
    company,
    _id: { $ne: req.params.id }, // Exclude current record
  });

  if (existing) {
    websocketHandler.sendLog(req, `Duplicate designation found during update: ${designation}`, constants.LOG_TYPES.WARN);
    return next(new AppError(req.t('company.designationExists'), 400));
  }

  // ✅ Proceed with update
  websocketHandler.sendLog(req, `Updating designation with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);

  const updatedDesignation = await Designation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedDesignation) {
    websocketHandler.sendLog(req, `Designation not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.designationNotFound'), 404));
  }

  websocketHandler.sendLog(req, `Designation updated: ${updatedDesignation._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: updatedDesignation,
  });
});


exports.getAllDesignationsByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllDesignationsByCompany', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching designations for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const designations = await Designation.find({}).where('company').equals(req.cookies.companyId);
  websocketHandler.sendLog(req, `Retrieved ${designations.length} designations`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: designations
  });
});

exports.deleteDesignation = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteDesignation', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting designation with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const designation = await Designation.findByIdAndDelete(req.params.id);

  if (!designation) {
    websocketHandler.sendLog(req, `Designation not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.designationNotFound'), 404));
  }
  websocketHandler.sendLog(req, `Designation deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.createBand = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createBand', constants.LOG_TYPES.INFO);
  try {
    const company = req.cookies.companyId; // Get company from cookies

    // Validate if company value exists in cookies
    if (!company) {
      websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.companyIdMissing'), 400));
    }
    const { band } = req.body;
    req.body.company = company; // Set company in the request body
    websocketHandler.sendLog(req, `Creating band for company: ${company}`, constants.LOG_TYPES.TRACE);
    const existing = await Band.findOne({ band: band, company });

    if (existing) {
      websocketHandler.sendLog(req, `band already exists: ${band}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('company.bandExists'), 400));
    }
    const bandCreated = await Band.create(req.body);
    websocketHandler.sendLog(req, `Band created: ${band._id}`, constants.LOG_TYPES.INFO);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: bandCreated
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error creating band: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

// Get a Band
exports.getBand = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getBand', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching band with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const band = await Band.findById(req.params.id);
    if (!band) {
      websocketHandler.sendLog(req, `Band not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('company.bandNotFound')
      });
    }
    websocketHandler.sendLog(req, `Band retrieved: ${band._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: band
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error fetching band: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.serverError')
    });
  }
};

// Update a Band
exports.updateBand = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateBand', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating band with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const { band } = req.body;
    const company = req.cookies.companyId; // Get company from cookies

    // Validate if company value exists in cookies
    if (!company) {
      websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.companyIdMissing'), 400));
    }
    req.body.company = company; // Set company in the request body
    websocketHandler.sendLog(req, `Creating band for company: ${company}`, constants.LOG_TYPES.TRACE);
    const existing = await Band.findOne({ _id: { $ne: req.params.id }, band: band, company });

    if (existing) {
      websocketHandler.sendLog(req, `Band already exists: ${band}`, constants.LOG_TYPES.WARN);
      return next(new AppError(req.t('company.bandExists'), 400));
    }
    const bandUpdated = await Band.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bandUpdated) {
      websocketHandler.sendLog(req, `Band not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.bandNotFound'), 400));
    }
    websocketHandler.sendLog(req, `Band updated: ${bandUpdated._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: bandUpdated
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error updating band: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

// Get All Band by companyId
exports.getAllBandsByCompanyId = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllBandsByCompanyId', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching bands for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  try {
    const bands = await Band.find({}).where('company').equals(req.cookies.companyId);
    websocketHandler.sendLog(req, `Retrieved ${bands.length} bands`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: bands
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error fetching bands: ${error.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.serverError')
    });
  }
};

// Delete Band
exports.deleteBand = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteBand', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting band with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const band = await Band.findByIdAndDelete(req.params.id);
    if (!band) {
      websocketHandler.sendLog(req, `Band not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.bandNotFound'), 400));
    }
    websocketHandler.sendLog(req, `Band deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  } catch (error) {
    websocketHandler.sendLog(req, `Error deleting band: ${error.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

// Add a new signatory
exports.createSignatory = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createSignatory', constants.LOG_TYPES.INFO);
  try {
    const company = req.cookies.companyId; // Get company from cookies

    // Validate if company value exists in cookies
    if (!company) {
      websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.companyIdMissing'), 400));
    }
    req.body.company = company; // Set company in the request body
    websocketHandler.sendLog(req, `Creating signatory for company: ${company}`, constants.LOG_TYPES.TRACE);
    const signatory = await Signatory.create(req.body);
    websocketHandler.sendLog(req, `Signatory created: ${signatory._id}`, constants.LOG_TYPES.INFO);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: signatory
    });
  } catch (err) {
    websocketHandler.sendLog(req, `Error creating signatory: ${err.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

// Get a signatory by ID
exports.getSignatory = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getSignatory', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching signatory with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const signatory = await Signatory.findById(req.params.id);
    if (!signatory) {
      websocketHandler.sendLog(req, `Signatory not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: req.t('company.signatoryNotFound')
      });
    }
    websocketHandler.sendLog(req, `Signatory retrieved: ${signatory._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: signatory
    });
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching signatory: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.serverError')
    });
  }
};

// Update a signatory by ID
exports.updateSignatory = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateSignatory', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating signatory with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const signatory = await Signatory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!signatory) {
      websocketHandler.sendLog(req, `Signatory not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.signatoryNotFound'), 400));
    }
    websocketHandler.sendLog(req, `Signatory updated: ${signatory._id}`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: signatory
    });
  } catch (err) {
    websocketHandler.sendLog(req, `Error updating signatory: ${err.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

// Get all signatories by companyId
exports.getAllSignatoriesByCompanyId = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getAllSignatoriesByCompanyId', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching signatories for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  try {
    const signatories = await Signatory.find({ company: req.cookies.companyId });
    websocketHandler.sendLog(req, `Retrieved ${signatories.length} signatories`, constants.LOG_TYPES.INFO);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: signatories
    });
  } catch (err) {
    websocketHandler.sendLog(req, `Error fetching signatories: ${err.message}`, constants.LOG_TYPES.ERROR);
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.serverError')
    });
  }
};

// Delete a signatory by ID
exports.deleteSignatory = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteSignatory', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting signatory with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  try {
    const signatory = await Signatory.findByIdAndDelete(req.params.id);
    if (!signatory) {
      websocketHandler.sendLog(req, `Signatory not found: ${req.params.id}`, constants.LOG_TYPES.ERROR);
      return next(new AppError(req.t('company.signatoryNotFound'), 400));
    }
    websocketHandler.sendLog(req, `Signatory deleted: ${req.params.id}`, constants.LOG_TYPES.INFO);
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  } catch (err) {
    websocketHandler.sendLog(req, `Error deleting signatory: ${err.message}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.serverError'), 400));
  }
};

// Add a new tax slab
// exports.createTaxSlab = catchAsync(async (req, res, next) => {
//   websocketHandler.sendLog(req, 'Starting createTaxSlab', constants.LOG_TYPES.INFO);
//   const companyId = req.cookies.companyId; // Get company from cookies

//   // Validate if company value exists in cookies
//   if (!companyId) {
//     websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);

//     return next(new AppError(req.t('company.companyIdMissing'), 400));

//   }
//   req.body.company = companyId; // Set company in the request body
//   websocketHandler.sendLog(req, `Creating tax slab for company: ${companyId}`, constants.LOG_TYPES.TRACE);

//   const { IncomeTaxSlabs, minAmount, maxAmount, taxPercentage, regime, cycle, company, holidayapplicableEmployee } = req.body;

//   const taxSlab = await TaxSlab.create({
//     IncomeTaxSlabs,
//     minAmount,
//     maxAmount,
//     taxPercentage,
//     regime,
//     cycle,
//     company,
//     holidayapplicableEmployee,
//   });
//   websocketHandler.sendLog(req, `Tax slab created: ${taxSlab._id}`, constants.LOG_TYPES.INFO);

//   res.status(201).json({
//     status: constants.APIResponseStatus.Success,
//     data: taxSlab,
//   });
// });
exports.createTaxSlab = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting createTaxSlab', constants.LOG_TYPES.INFO);

  const companyId = req.cookies.companyId; // Get company from cookies

  // 1. Validate if company value exists in cookies
  if (!companyId) {
    websocketHandler.sendLog(req, 'Company ID missing in cookies', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.companyIdMissing'), 400));
  }

  req.body.company = companyId; // Set company in the request body
  // Add Financial Year and other destructured variables
  const { 
    IncomeTaxSlabs, 
    minAmount, 
    maxAmount, 
    taxPercentage, 
    regime, 
    cycle, 
    company, 
    holidayapplicableEmployee,
//     financialYear // ✨ NEW: Destructure financialYear
  } = req.body;

const financialYear = req.body.cycle; // ✨ NEW: Assign financialYear from req.body
  websocketHandler.sendLog(req, `Creating tax slab for company: ${companyId}, regime: ${regime}, financialYear: ${financialYear}`, constants.LOG_TYPES.TRACE);

  // 2. NEW: Validate if financialYear is present
  if (!financialYear) {
    websocketHandler.sendLog(req, 'Financial Year missing in request body', constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('taxslab.financialYearMissing'), 400));
  }

//   // 3. NEW: Check for existing tax slab for the unique combination
//   const existingTaxSlab = await TaxSlab.findOne({
//     company: companyId,
//     financialYear: financialYear, // Unique constraint 1
//     regime: regime,               // Unique constraint 2
//     IncomeTaxSlabs: IncomeTaxSlabs 
//   });

//   if (existingTaxSlab) {
//     websocketHandler.sendLog(req, `Tax slab already exists for company ${companyId}, regime ${regime}, and financial year ${financialYear}`, constants.LOG_TYPES.ERROR);
//     return next(new AppError(req.t('company.duplicateEntry'), 409)); // Use 409 Conflict status
//   }

  const taxSlab = await TaxSlab.create({
    IncomeTaxSlabs,
    minAmount,
    maxAmount,
    taxPercentage,
    regime,
    cycle,
    company,
    holidayapplicableEmployee,
    financialYear, // ✨ NEW: Include financialYear in creation
  });

  websocketHandler.sendLog(req, `Tax slab created: ${taxSlab._id}`, constants.LOG_TYPES.INFO);

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlab,
  });
});

exports.getTaxSlabsByCompany = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaxSlabsByCompany', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching tax slabs for company: ${req.cookies.companyId}`, constants.LOG_TYPES.TRACE);
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.next) || 10;
  const query = {
    company: req.cookies.companyId
  };
  // Get the total count of documents that match the query
  const totalCount = await TaxSlab.countDocuments(query);
  const taxSlabs = await TaxSlab.find(query).skip(skip).limit(limit);
  websocketHandler.sendLog(req, `Retrieved ${taxSlabs.length} tax slabs, total: ${totalCount}`, constants.LOG_TYPES.INFO);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlabs,
    total: totalCount
  });
});

// Get all tax slabs by year
exports.getTaxSlabsByCycle = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaxSlabsByCycle', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching tax slabs for cycle: ${req.params.cycle}`, constants.LOG_TYPES.TRACE);
  const { cycle } = req.params;
  const query = {
    cycle: cycle,
    company: req.cookies.companyId,
  };
  const taxSlabs = await TaxSlab.find(query);
  websocketHandler.sendLog(req, `Retrieved ${taxSlabs.length} tax slabs`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlabs,
  });
});

// Update a tax slab
exports.updateTaxSlab = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting updateTaxSlab', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Updating tax slab with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const { id } = req.params;
  const updates = req.body;

  const taxSlab = await TaxSlab.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

  if (!taxSlab) {
    websocketHandler.sendLog(req, `Tax slab not found: ${id}`, constants.LOG_TYPES.ERROR);

    return next(new AppError(req.t('company.taxSlabNotFound'), 400));

  }
  websocketHandler.sendLog(req, `Tax slab updated: ${taxSlab._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlab,
  });
});

// Get a tax slab by ID
exports.getTaxSlabById = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting getTaxSlabById', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Fetching tax slab with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const { id } = req.params;

  const taxSlab = await TaxSlab.findById(id);

  if (!taxSlab) {
    websocketHandler.sendLog(req, `Tax slab not found: ${id}`, constants.LOG_TYPES.ERROR);
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: req.t('company.taxSlabNotFound'),
    });
  }
  websocketHandler.sendLog(req, `Tax slab retrieved: ${taxSlab._id}`, constants.LOG_TYPES.INFO);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlab,
  });
});

// Delete a tax slab
exports.deleteTaxSlab = catchAsync(async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting deleteTaxSlab', constants.LOG_TYPES.INFO);
  websocketHandler.sendLog(req, `Deleting tax slab with ID: ${req.params.id}`, constants.LOG_TYPES.TRACE);
  const { id } = req.params;

  const taxSlab = await TaxSlab.findByIdAndDelete(id);

  if (!taxSlab) {
    websocketHandler.sendLog(req, `Tax slab not found: ${id}`, constants.LOG_TYPES.ERROR);
    return next(new AppError(req.t('company.taxSlabNotFound'), 400));

  }
  websocketHandler.sendLog(req, `Tax slab deleted: ${id}`, constants.LOG_TYPES.INFO);

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});
