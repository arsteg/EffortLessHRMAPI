const Company = require('../models/companyModel');
const Role = require('../models/permissions/roleModel');
const catchAsync = require('../utils/catchAsync');
const HolidayCalendar = require('../models/Company/holidayCalendar');
const HolidayapplicableEmployee=require('../models/Company/HolidayApplicableEmployee');
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


exports.getAllCompanies = catchAsync(async (req, res, next) => {
  const companies = await Company.find();
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: companies
  });
});

exports.deleteCompany = catchAsync(async (req, res, next) => {
  const document = await Company.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.updateCompany =  catchAsync(async (req, res, next) => {
  const document = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // If not found - add new
    runValidators: true // Validate data
  });
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: {
      data: document
    }
  });
});

exports.getCompany  = catchAsync(async (req, res, next) => {    
const company = await Company.findById(req.params.id);  
res.status(200).json({
  status: constants.APIResponseStatus.Success,
  data: {
    company: company
  }
});  
});
 // Get Country List
 exports.getCompanyList = catchAsync(async (req, res, next) => {    
    const companyList = await Company.find({}).all();  
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: {
        companyList: companyList
      }
    });  
});
exports.createHoliday = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body

  const holidayCalendar = await HolidayCalendar.create(req.body);
  const users = req.body.users;
 
  // Iterate through the users array and add unique user IDs to uniqueUsers array
  const uniqueUsers = new Set(); // Using a Set to store unique user IDs

  // Iterate through the users array and add unique user IDs to uniqueUsers set
  for (const val of users) {
    const userId = val.user; // Get the user ID from the object
    if (!uniqueUsers.has(userId)) { // Check if user ID already exists
      uniqueUsers.add(userId);
    }
  }
  // Iterate through the users array and create UserRegularizationReason for each user
  const holidayapplicableEmployees = [];
  for (const user of uniqueUsers) {
    const holidayapplicableEmployee = await HolidayapplicableEmployee.create({
      user: user,
      holiday: holidayCalendar._id // Assuming regularizationReason is the newly created document
    });
    holidayapplicableEmployees.push(holidayapplicableEmployee);
  }
  holidayCalendar.holidayapplicableEmployee = holidayapplicableEmployees;
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendar
  });
});

exports.getHoliday = catchAsync(async (req, res, next) => {
  const holidayCalendar = await HolidayCalendar.findById(req.params.id);

  if (!holidayCalendar) {
    return next(new AppError('Holiday Calendar not found', 404));
  }
  if(holidayCalendar) 
      {
        
         
          const holidayapplicableEmployees = await HolidayapplicableEmployee.find({}).where('holiday').equals(holidayCalendar._id);  
          if(holidayapplicableEmployees) 
            {
              holidayCalendar.holidayapplicableEmployee = holidayapplicableEmployees;
            }
            else{
              holidayCalendar.holidayapplicableEmployee=null;
            }
          
      }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendar
  });
});

exports.updateHoliday = catchAsync(async (req, res, next) => {
  const isHolidayCalendar = await HolidayCalendar.findById(req.params.id);

  if (!isHolidayCalendar) {
    return next(new AppError('Holiday Calendar not found', 404));
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
    return next(new AppError('HolidayCalendar not found', 404));
  }

  holidayCalendar.holidayapplicableEmployee =  await HolidayapplicableEmployee.find({}).where('holiday').equals(holidayCalendar._id);;
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendar
  });
});


exports.deleteHoliday = catchAsync(async (req, res, next) => {
  const holidayCalendar = await HolidayCalendar.findByIdAndDelete(req.params.id);
  if (!holidayCalendar) {
    return next(new AppError('Regularization Reason not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.getAllHolidaysByYear = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;   
    const years = req.body.years || null;
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
    if (years && years.length > 0) {
      const startDate = new Date(Math.min(...years), 0, 1); // Start of the earliest year
      const endDate = new Date(Math.max(...years), 11, 31, 23, 59, 59); // End of the latest year

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

    if(holidayCalendars)
      {        
          for(var i = 0; i < holidayCalendars.length; i++) {     
          const holidayapplicableEmployee = await HolidayapplicableEmployee.find({}).where('holiday').equals(holidayCalendars[i]._id);  
          if(holidayapplicableEmployee) 
            {
              holidayCalendars[i].holidayapplicableEmployee = holidayapplicableEmployee;
            }
            else{
              holidayCalendars[i].holidayapplicableEmployee=null;
            }
          }
      }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: holidayCalendars,
    total: totalCount
  });
});

exports.createZone = async (req, res, next) => {
  try {
    const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  
    const zone = await Zone.create(req.body);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

exports.getZone = async (req, res, next) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Zone not found'
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

exports.updateZone = async (req, res, next) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!zone) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Zone not found'
      });
    }

    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: zone
    });
  } catch (error) {
    next(error);
  }
};

exports.getZonesByCompanyId = async (req, res, next) => {
  try {
    const zones = await Zone.find({ company: req.cookies.companyId });
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: zones
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteZone = async (req, res, next) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Zone not found'
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  } catch (error) {
    next(error);
  }
};
// Add a Location
exports.addLocation = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  
  const location = await Location.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: location
  });
});

// Get a Location
exports.getLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findById(req.params.id);
  if (!location) {
    return next(new AppError('Location not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: location
  });
});

// Update a Location
exports.updateLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!location) {
    return next(new AppError('Location not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: location
  });
});

// Get All Locations by companyId
exports.getAllLocationsByCompanyId = catchAsync(async (req, res, next) => { 
  const locations = await Location.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: locations
  });
});

// Delete a Location
exports.deleteLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByIdAndDelete(req.params.id);
  if (!location) {
    return next(new AppError('Location not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// Add a Department
exports.createDepartment = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status:constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  const { departmentName, departmentCode} = req.body;
  const department = await Department.create({ departmentName, departmentCode, company });
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: department
  });
});

// Get a Department
exports.getDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return next(new AppError('Department not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: department
  });
});

// Update a Department
exports.updateDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!department) {
    return next(new AppError('Department not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: department
  });
});

// Get All Departments by CompanyId
exports.getAllDepartmentsByCompanyId = catchAsync(async (req, res, next) => {
  const departments = await Department.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: departments
  });
});

// Delete Department
exports.deleteDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    return next(new AppError('Department not found', 404));
  }
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

// controllers/companyController.js

exports.createSubDepartment = async (req, res, next) => {
    try {
      const company = req.cookies.companyId; // Get company from cookies
  
      // Validate if company value exists in cookies
      if (!company) {
        return res.status(500).json({
          status: constants.APIResponseStatus.Failure,
          message: 'Company information missing in cookies',
        });
      }
      req.body.company = company; // Set company in the request body
        const subDepartment = await SubDepartment.create(req.body);
        res.status(201).json({
            status: constants.APIResponseStatus.Success,
            data: subDepartment
        });
    } catch (err) {
        res.status(400).json({
            status: constants.APIResponseStatus.Failure,
            message: err.message
        });
    }
};

exports.getSubDepartment = async (req, res, next) => {
    try {
        const subDepartment = await SubDepartment.findById(req.params.id);
        if (!subDepartment) {
            res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'SubDepartment not found'
            });
        } else {
            res.status(200).json({
                status: constants.APIResponseStatus.Success,
                data: subDepartment
            });
        }
    } catch (err) {
        res.status(500).json({
            status: constants.APIResponseStatus.Failure,
            message: err.message
        });
    }
};

exports.updateSubDepartment = async (req, res, next) => {
    try {
        const subDepartment = await SubDepartment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!subDepartment) {
            res.status(404).json({
                status:constants.APIResponseStatus.Failure,
                message: 'SubDepartment not found'
            });
        } else {
            res.status(200).json({
                status: constants.APIResponseStatus.Success,
                data: subDepartment
            });
        }
    } catch (err) {
        res.status(500).json({
            status: constants.APIResponseStatus.Failure,
            message: err.message
        });
    }
};

exports.getAllSubDepartmentsByCompanyId = async (req, res, next) => {
    try {
        const subDepartments = await SubDepartment.find({}).where('company').equals(req.cookies.companyId);
        res.status(200).json({
            status: constants.APIResponseStatus.Success,
            data: subDepartments
        });
    } catch (err) {
        res.status(500).json({
            status: constants.APIResponseStatus.Failure,
            message: err.message
        });
    }
};

exports.deleteSubDepartment = async (req, res, next) => {
    try {
        const subDepartment = await SubDepartment.findByIdAndDelete(req.params.id);
        if (!subDepartment) {
            res.status(404).json({
                status: constants.APIResponseStatus.Failure,
                message: 'SubDepartment not found'
            });
        } else {
            res.status(204).json({
                status: constants.APIResponseStatus.Success,
                data: null
            });
        }
    } catch (err) {
        res.status(500).json({
            status:constants.APIResponseStatus.Failure,
            message: err.message
        });
    }
};
exports.createDesignation = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  const designation = await Designation.create(req.body);
  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: designation
  });
});

exports.getDesignation = catchAsync(async (req, res, next) => {
  const designation = await Designation.findById(req.params.id);
  if (!designation) {
    return next(new AppError('Designation not found', 404));
  }
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: designation
  });
});

exports.updateDesignation = catchAsync(async (req, res, next) => {
  const designation = await Designation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!designation) {
    return next(new AppError('Designation not found', 404));
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: designation
  });
});

exports.getAllDesignationsByCompany = catchAsync(async (req, res, next) => {
  const designations = await Designation.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: designations
  });
});

exports.deleteDesignation = catchAsync(async (req, res, next) => {
  const designation = await Designation.findByIdAndDelete(req.params.id);
  
  if (!designation) {
    return next(new AppError('Designation not found', 404));
  }
  
  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null
  });
});

exports.createBand = async (req, res, next) => {
  try {
    const company = req.cookies.companyId; // Get company from cookies
  
    // Validate if company value exists in cookies
    if (!company) {
      return res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Company information missing in cookies',
      });
    }
    req.body.company = company; // Set company in the request body
    const band = await Band.create(req.body);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: band
    });
  } catch (error) {
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: error.message
    });
  }
};

// Get a Band
exports.getBand = async (req, res, next) => {
  try {
    const band = await Band.findById(req.params.id);
    if (!band) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Band not found'
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: band
    });
  } catch (error) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: error.message
    });
  }
};

// Update a Band
exports.updateBand = async (req, res, next) => {
  try {
    const band = await Band.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!band) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Band not found'
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: band
    });
  } catch (error) {
    res.status(500).json({
      status:constants.APIResponseStatus.Failure,
      message: error.message
    });
  }
};

// Get All Band by companyId
exports.getAllBandsByCompanyId = async (req, res, next) => {
  try {
    const bands = await Band.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: bands
    });
  } catch (error) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: error.message
    });
  }
};

// Delete Band
exports.deleteBand = async (req, res, next) => {
  try {
    const band = await Band.findByIdAndDelete(req.params.id);
    if (!band) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Band not found'
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: error.message
    });
  }
};

// Add a new signatory
exports.createSignatory = async (req, res, next) => {
  try {
    const company = req.cookies.companyId; // Get company from cookies
  
    // Validate if company value exists in cookies
    if (!company) {
      return res.status(500).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Company information missing in cookies',
      });
    }
    req.body.company = company; // Set company in the request body
    const signatory = await Signatory.create(req.body);
    res.status(201).json({
      status: constants.APIResponseStatus.Success,
      data: signatory
    });
  } catch (err) {
    res.status(400).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

// Get a signatory by ID
exports.getSignatory = async (req, res, next) => {
  try {
    const signatory = await Signatory.findById(req.params.id);
    if (!signatory) {
      return res.status(404).json({
        status:constants.APIResponseStatus.Failure,
        message: 'Signatory not found'
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: signatory
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

// Update a signatory by ID
exports.updateSignatory = async (req, res, next) => {
  try {
    const signatory = await Signatory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!signatory) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Signatory not found'
      });
    }
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: signatory
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

// Get all signatories by companyId
exports.getAllSignatoriesByCompanyId = async (req, res, next) => {
  try {
    const signatories = await Signatory.find({ company: req.cookies.companyId });
    res.status(200).json({
      status: constants.APIResponseStatus.Success,
      data: signatories
    });
  } catch (err) {
    res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

// Delete a signatory by ID
exports.deleteSignatory = async (req, res, next) => {
  try {
    const signatory = await Signatory.findByIdAndDelete(req.params.id);
    if (!signatory) {
      return res.status(404).json({
        status: constants.APIResponseStatus.Failure,
        message: 'Signatory not found'
      });
    }
    res.status(204).json({
      status: constants.APIResponseStatus.Success,
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status:constants.APIResponseStatus.Failure,
      message: err.message
    });
  }
};

// Add a new tax slab
exports.createTaxSlab = catchAsync(async (req, res, next) => {
  const companyId = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!companyId) {
    return res.status(500).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = companyId; // Set company in the request body

  const { IncomeTaxSlabs, minAmount, maxAmount, taxPercentage,regime, cycle, company, holidayapplicableEmployee } = req.body;

  const taxSlab = await TaxSlab.create({
    IncomeTaxSlabs,
    minAmount,
    maxAmount,
    taxPercentage,
    regime,
    cycle,
    company,
    holidayapplicableEmployee,
  });

  res.status(201).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlab,
  });
});
exports.getTaxSlabsByCompany = catchAsync(async (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.next) || 10;  
    const query = {
      company: req.cookies.companyId };   
    // Get the total count of documents that match the query
    const totalCount = await TaxSlab.countDocuments(query);
    const taxSlabs = await TaxSlab.find(query).skip(skip).limit(limit);
  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlabs,
    total: totalCount
  });
});

// Get all tax slabs by year
exports.getTaxSlabsByCycle = catchAsync(async (req, res, next) => {
  const { cycle } = req.params;
  const query = {
    cycle: cycle };
  const taxSlabs = await TaxSlab.find(query);

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlabs,
  });
});

// Update a tax slab
exports.updateTaxSlab = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const taxSlab = await TaxSlab.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

  if (!taxSlab) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Tax slab not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlab,
  });
});

// Get a tax slab by ID
exports.getTaxSlabById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const taxSlab = await TaxSlab.findById(id);

  if (!taxSlab) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Tax slab not found',
    });
  }

  res.status(200).json({
    status: constants.APIResponseStatus.Success,
    data: taxSlab,
  });
});

// Delete a tax slab
exports.deleteTaxSlab = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const taxSlab = await TaxSlab.findByIdAndDelete(id);

  if (!taxSlab) {
    return res.status(404).json({
      status: constants.APIResponseStatus.Failure,
      message: 'Tax slab not found',
    });
  }

  res.status(204).json({
    status: constants.APIResponseStatus.Success,
    data: null,
  });
});
