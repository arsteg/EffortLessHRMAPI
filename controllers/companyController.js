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

exports.deleteCompany = catchAsync(async (req, res, next) => {
  const document = await Company.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
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
    status: 'success',
    data: {
      data: document
    }
  });
});

exports.getCompany  = catchAsync(async (req, res, next) => {    
const company = await Company.findById(req.params.id);  
res.status(200).json({
  status: 'success',
  data: {
    company: company
  }
});  
});
 // Get Country List
 exports.getCompanyList = catchAsync(async (req, res, next) => {    
    const companyList = await Company.find({}).all();  
    res.status(200).json({
      status: 'success',
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
      status: 'failure',
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
    status: 'success',
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
    status: 'success',
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
  console.log(newUsers);
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
    status: 'success',
    data: holidayCalendar
  });
});


exports.deleteHoliday = catchAsync(async (req, res, next) => {
  const holidayCalendar = await HolidayCalendar.findByIdAndDelete(req.params.id);
  if (!holidayCalendar) {
    return next(new AppError('Regularization Reason not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllHolidaysByYear = catchAsync(async (req, res, next) => {
  const holidayCalendars = await HolidayCalendar.find({}).where('company').equals(req.cookies.companyId).where('year').equals(req.params.year);
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
    status: 'success',
    data: holidayCalendars
  });
});

exports.createZone = async (req, res, next) => {
  try {
    const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  
    const zone = await Zone.create(req.body);
    res.status(201).json({
      status: 'success',
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
        status: 'failure',
        message: 'Zone not found'
      });
    }
    res.status(200).json({
      status: 'success',
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
        status: 'failure',
        message: 'Zone not found'
      });
    }

    res.status(200).json({
      status: 'success',
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
      status: 'success',
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
        status: 'failure',
        message: 'Zone not found'
      });
    }
    res.status(204).json({
      status: 'success',
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
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  
  const location = await Location.create(req.body);
  res.status(201).json({
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: location
  });
});

// Get All Locations by companyId
exports.getAllLocationsByCompanyId = catchAsync(async (req, res, next) => { 
  const locations = await Location.find({ company: req.cookies.companyId });
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: null
  });
});

// Add a Department
exports.createDepartment = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  const { departmentName, departmentCode} = req.body;
  const department = await Department.create({ departmentName, departmentCode, company });
  res.status(201).json({
    status: 'success',
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
    status: 'success',
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
    status: 'success',
    data: department
  });
});

// Get All Departments by CompanyId
exports.getAllDepartmentsByCompanyId = catchAsync(async (req, res, next) => {
  console.log("hii");
  const departments = await Department.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
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
    status: 'success',
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
          status: 'failure',
          message: 'Company information missing in cookies',
        });
      }
      req.body.company = company; // Set company in the request body
        const subDepartment = await SubDepartment.create(req.body);
        res.status(201).json({
            status: 'success',
            data: subDepartment
        });
    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.getSubDepartment = async (req, res, next) => {
    try {
        const subDepartment = await SubDepartment.findById(req.params.id);
        if (!subDepartment) {
            res.status(404).json({
                status: 'failure',
                message: 'SubDepartment not found'
            });
        } else {
            res.status(200).json({
                status: 'success',
                data: subDepartment
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'failure',
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
                status: 'failure',
                message: 'SubDepartment not found'
            });
        } else {
            res.status(200).json({
                status: 'success',
                data: subDepartment
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.getAllSubDepartmentsByCompanyId = async (req, res, next) => {
    try {
        const subDepartments = await SubDepartment.find({}).where('company').equals(req.cookies.companyId);
        res.status(200).json({
            status: 'success',
            data: subDepartments
        });
    } catch (err) {
        res.status(500).json({
            status: 'failure',
            message: err.message
        });
    }
};

exports.deleteSubDepartment = async (req, res, next) => {
    try {
        const subDepartment = await SubDepartment.findByIdAndDelete(req.params.id);
        if (!subDepartment) {
            res.status(404).json({
                status: 'failure',
                message: 'SubDepartment not found'
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
exports.createDesignation = catchAsync(async (req, res, next) => {
  const company = req.cookies.companyId; // Get company from cookies
  
  // Validate if company value exists in cookies
  if (!company) {
    return res.status(500).json({
      status: 'failure',
      message: 'Company information missing in cookies',
    });
  }
  req.body.company = company; // Set company in the request body
  const designation = await Designation.create(req.body);
  res.status(201).json({
    status: 'success',
    data: designation
  });
});

exports.getDesignation = catchAsync(async (req, res, next) => {
  const designation = await Designation.findById(req.params.id);
  if (!designation) {
    return next(new AppError('Designation not found', 404));
  }
  res.status(200).json({
    status: 'success',
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
    status: 'success',
    data: designation
  });
});

exports.getAllDesignationsByCompany = catchAsync(async (req, res, next) => {
  const designations = await Designation.find({}).where('company').equals(req.cookies.companyId);
  res.status(200).json({
    status: 'success',
    data: designations
  });
});

exports.deleteDesignation = catchAsync(async (req, res, next) => {
  const designation = await Designation.findByIdAndDelete(req.params.id);
  
  if (!designation) {
    return next(new AppError('Designation not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createBand = async (req, res, next) => {
  try {
    const company = req.cookies.companyId; // Get company from cookies
  
    // Validate if company value exists in cookies
    if (!company) {
      return res.status(500).json({
        status: 'failure',
        message: 'Company information missing in cookies',
      });
    }
    req.body.company = company; // Set company in the request body
    const band = await Band.create(req.body);
    res.status(201).json({
      status: 'success',
      data: band
    });
  } catch (error) {
    res.status(400).json({
      status: 'failure',
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
        status: 'failure',
        message: 'Band not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: band
    });
  } catch (error) {
    res.status(500).json({
      status: 'failure',
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
        status: 'failure',
        message: 'Band not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: band
    });
  } catch (error) {
    res.status(500).json({
      status: 'failure',
      message: error.message
    });
  }
};

// Get All Band by companyId
exports.getAllBandsByCompanyId = async (req, res, next) => {
  try {
    const bands = await Band.find({}).where('company').equals(req.cookies.companyId);
    res.status(200).json({
      status: 'success',
      data: bands
    });
  } catch (error) {
    res.status(500).json({
      status: 'failure',
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
        status: 'failure',
        message: 'Band not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'failure',
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
        status: 'failure',
        message: 'Company information missing in cookies',
      });
    }
    req.body.company = company; // Set company in the request body
    const signatory = await Signatory.create(req.body);
    res.status(201).json({
      status: 'success',
      data: signatory
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
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
        status: 'failure',
        message: 'Signatory not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: signatory
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
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
        status: 'failure',
        message: 'Signatory not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: signatory
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};

// Get all signatories by companyId
exports.getAllSignatoriesByCompanyId = async (req, res, next) => {
  try {
    const signatories = await Signatory.find({ company: req.cookies.companyId });
    res.status(200).json({
      status: 'success',
      data: signatories
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
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
        status: 'failure',
        message: 'Signatory not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message
    });
  }
};
