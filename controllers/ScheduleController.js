const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const EmployeeLeaveAssignment = require('../models/Leave/EmployeeLeaveAssignmentModel');
const User = require('../models/permissions/userModel');
const LeaveAssigned = require("../models/Leave/LeaveAssignedModel");
const catchAsync = require('../utils/catchAsync');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');
const EventNotification = require('../models/eventNotification/eventNotification');
const UserNotification = require('../models/eventNotification/userNotification');
const { RecurringFrequency, NotificationChannel } = require('../models/eventNotification/enums');
const eventNotificationController = require('./eventNotificationController.js');
const EventNotificationType = require('../models/eventNotification/eventNotificationType.js');
const userSubordinate = require("../models/userSubordinateModel");
const Appointment = require("../models/permissions/appointmentModel");
const Company = require("../models/companyModel.js");
const EmailTemplate = require('../models/commons/emailTemplateModel');
const sendEmail = require('../utils/email');
const whatsappService = require('../Services/whatsapp.service');

assignLeavesByJobsBackup = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting leave assignment process', constants.LOG_TYPES.INFO);

  const users = await User.find({});
  websocketHandler.sendLog(req, `Found ${users.length} users to process`, constants.LOG_TYPES.DEBUG);

  if (users.length > 0) {
    for (const user of users) {
      websocketHandler.sendLog(req, `Processing leave assignment for user: ${user._id}`, constants.LOG_TYPES.TRACE);

      const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({})
        .where('user').equals(user._id.toString());

      if (employeeLeaveAssignment) {
        websocketHandler.sendLog(req, `Found leave assignment for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

        //const leaveTemplateCategory = await LeaveTemplateCategory.findOne({})
        const leaveTemplateCategories = await LeaveTemplateCategory.find({})
          .where('leaveTemplate').equals(employeeLeaveAssignment.leaveTemplate._id.toString());

        if (leaveTemplateCategories.length > 0) {
          for (const leaveTemplateCategory of leaveTemplateCategories) {
            const leaveCategory = await LeaveCategory.findById(leaveTemplateCategory.leaveCategory);
            websocketHandler.sendLog(req, `Processing leave category: ${leaveCategory._id} for user: ${user._id}`, constants.LOG_TYPES.TRACE);

            const cycle = await createFiscalCycle();
            const employee = user._id.toString();
            const category = leaveCategory._id;
            const type = leaveCategory.leaveAccrualPeriod;
            //Need to verify start and end month because get month is starting from 0 not 1 Jan 0, feb 1...
            const createdOn = new Date();
            var startMonth = createdOn.getMonth();
            var openingBalance = 0;
            const leaveApplied = 0;
            var leaveRemaining = 0;
            var closingBalance = 0;
            const leaveTaken = 0;

            if (leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Monthly) {
              const endMonth = createdOn.getMonth();
              const accruedBalance = leaveTemplateCategory.accrualRatePerPeriod;
              websocketHandler.sendLog(req, `Creating monthly leave assignment - accruedBalance: ${accruedBalance}`, constants.LOG_TYPES.DEBUG);

              try {
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
                  company: user.company._id.toString()
                });
                websocketHandler.sendLog(req, `Successfully created monthly leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
              } catch (error) {
                websocketHandler.sendLog(req, `Failed to create monthly leave assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
              }
            }

            if (leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Annually) {
              const endMonth = 12;
              const assignmentExists = await doesLeaveAssignmentExist(employee, cycle, category);
              websocketHandler.sendLog(req, `Checking existing annual assignment for user: ${user._id} - exists: ${assignmentExists}`, constants.LOG_TYPES.TRACE);

              if (!assignmentExists) {
                var ratePerPeriod = leaveTemplateCategory.accrualRatePerPeriod;
                var balPerMonth = ratePerPeriod / 12;
                var accruedBalance = 0;
                accruedBalance = (((12 - startMonth) + 1) * balPerMonth);
                openingBalance = accruedBalance;
                leaveRemaining = accruedBalance;
                startMonth = startMonth + 1;

                try {
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
                    company: user.company._id.toString()
                  });
                  websocketHandler.sendLog(req, `Created annual leave assignment for user: ${user._id} with balance: ${accruedBalance}`, constants.LOG_TYPES.INFO);
                } catch (error) {
                  websocketHandler.sendLog(req, `Error creating annual leave assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
                }
              }
            }

            if (leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Semi_Annually) {
              const endMonth = startMonth + 6;
              const accruedBalance = 2;
              websocketHandler.sendLog(req, `Processing semi-annual leave for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

              startMonth = startMonth + 1;
              const existingLeaveAssignment = await LeaveAssigned.findOne({
                employee: employee,
                category: category,
                startMonth: startMonth,
                endMonth: endMonth
              });

              if (existingLeaveAssignment) {
                websocketHandler.sendLog(req, `Semi-annual leave assignment already exists for user: ${user._id}`, constants.LOG_TYPES.WARN);
              } else {
                startMonth = startMonth + 1;
                try {
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
                    company: leaveCategory.company.toString()
                  });
                  websocketHandler.sendLog(req, `Created semi-annual leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
                } catch (error) {
                  websocketHandler.sendLog(req, `Error creating semi-annual assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
                }
              }
            }

            if (leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Bi_Monthly) {
              const endMonth = createdOn.getMonth();
              const accruedBalance = leaveTemplateCategory.accrualRatePerPeriod;
              startMonth = startMonth + 1;
              websocketHandler.sendLog(req, `Processing bi-monthly leave for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

              try {
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
                  company: user.company._id.toString()
                });
                websocketHandler.sendLog(req, `Created bi-monthly leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
              } catch (error) {
                websocketHandler.sendLog(req, `Error creating bi-monthly assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
              }
            }

            if (leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Quarterly) {
              const accruedBalance = leaveTemplateCategory.accrualRatePerPeriod;
              const endMonth = createdOn.getMonth();
              endMonth.setMonth(startMonth.getMonth() + 4);
              startMonth = startMonth + 1;
              websocketHandler.sendLog(req, `Processing quarterly leave for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

              try {
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
                  company: user.company._id.toString()
                });
                websocketHandler.sendLog(req, `Created quarterly leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
              } catch (error) {
                websocketHandler.sendLog(req, `Error creating quarterly assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
              }
            }
          }
        } else {
          websocketHandler.sendLog(req, `No leave template category found for user: ${user._id}`, constants.LOG_TYPES.WARN);
        }
      } else {
        websocketHandler.sendLog(req, `No employee leave assignment found for user: ${user._id}`, constants.LOG_TYPES.WARN);
      }
    }
  } else {
    websocketHandler.sendLog(req, 'No users found for leave assignment', constants.LOG_TYPES.WARN);
  }

  websocketHandler.sendLog(req, 'Completed leave assignment process', constants.LOG_TYPES.INFO);
};

assignLeavesByJobs = async (req, res, next) => {
  websocketHandler.sendLog(req, 'Starting leave assignment process', constants.LOG_TYPES.INFO);

  const users = await User.find({});
  websocketHandler.sendLog(req, `Found ${users.length} users to process`, constants.LOG_TYPES.DEBUG);

  if (users.length > 0) {
    for (const user of users) {
      try {
        websocketHandler.sendLog(req, `Processing leave assignment for user: ${user._id}`, constants.LOG_TYPES.TRACE);

        const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({})
          .where('user').equals(user._id.toString());

        if (employeeLeaveAssignment) {
          websocketHandler.sendLog(req, `Found leave assignment for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

          // Fetch user's appointment to get joining date for pro-rating
          const userAppointment = await Appointment.findOne({ user: user._id });

          //const leaveTemplateCategory = await LeaveTemplateCategory.findOne({})
          const leaveTemplateCategories = await LeaveTemplateCategory.find({})
            .where('leaveTemplate').equals(employeeLeaveAssignment.leaveTemplate._id.toString());

          if (leaveTemplateCategories.length > 0) {
            for (const leaveTemplateCategory of leaveTemplateCategories) {
              try {
                const leaveCategory = await LeaveCategory.findById(leaveTemplateCategory.leaveCategory);
                websocketHandler.sendLog(req, `Processing leave category: ${leaveCategory._id} for user: ${user._id}`, constants.LOG_TYPES.TRACE);

                const cycle = await createFiscalCycle();
                const employee = user._id.toString();
                const category = leaveCategory._id;
                // Fix: Default to Annually if leaveAccrualPeriod is missing
                const accrualPeriod = leaveCategory.leaveAccrualPeriod || constants.Leave_Accrual_Period.Annually;
                const type = accrualPeriod;

                //Need to verify start and end month because get month is starting from 0 not 1 Jan 0, feb 1...
                const createdOn = new Date();
                var currentMonth = createdOn.getMonth();
                //var startMonth = currentMonth + 1;
                var openingBalance = 0;
                const leaveApplied = 0;
                var leaveRemaining = 0;
                var closingBalance = 0;
                const leaveTaken = 0;

                // Check if this is a new joiner (joined in current month) and apply pro-rating
                const isNewJoiner = userAppointment && isJoinedInCurrentMonth(userAppointment.joiningDate);
                const proRateSetting = leaveCategory.isProRateFirstMonthAccrualForNewJoinees;
                const cutoffDay = leaveCategory.dayOfTheMonthEmployeeNeedJoinToGetCreditForThatMonth || 15;

                const { startMonth, endMonth } = await getPeriodRange(currentMonth, accrualPeriod);
                console.log(`Determined period range for ${accrualPeriod}, user: ${user._id} - startMonth: ${startMonth}, endMonth: ${endMonth}`);
                if (accrualPeriod === constants.Leave_Accrual_Period.Monthly) {
                  var accruedBalance = 0;
                  var baseAccrual = leaveTemplateCategory.accrualRatePerPeriod;

                  // Apply pro-rating for new joiners in current month
                  if (isNewJoiner && userAppointment?.joiningDate) {
                    const joiningDay = new Date(userAppointment.joiningDate).getDate();
                    accruedBalance = calculateProRatedAccrual(baseAccrual, joiningDay, proRateSetting, cutoffDay);
                    websocketHandler.sendLog(req, `Pro-rated monthly leave for new joiner - base: ${baseAccrual}, prorated: ${accruedBalance}, setting: ${proRateSetting}`, constants.LOG_TYPES.DEBUG);
                  } else {
                    accruedBalance = baseAccrual;
                  }

                  websocketHandler.sendLog(req, `Creating monthly leave assignment - accruedBalance: ${accruedBalance}`, constants.LOG_TYPES.DEBUG);
                  openingBalance = accruedBalance;
                  leaveRemaining = accruedBalance;

                  const existingLeaveAssignment = await doesLeaveAssignmentExistV1({
                    employee,
                    category,
                    cycle,
                    startMonth,
                    endMonth
                  });

                  if (existingLeaveAssignment) {
                    websocketHandler.sendLog(req, `Monthly leave assignment already exists for user: ${user._id}`, constants.LOG_TYPES.WARN);
                  } else {
                    try {
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
                        company: user.company._id.toString()
                      });
                      websocketHandler.sendLog(req, `Successfully created monthly leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
                    } catch (error) {
                      websocketHandler.sendLog(req, `Failed to create monthly leave assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
                    }
                  }
                }

                if (accrualPeriod === constants.Leave_Accrual_Period.Annually) {
                  //const assignmentExists = await doesLeaveAssignmentExist(employee, cycle, category);
                  //websocketHandler.sendLog(req, `Checking existing annual assignment for user: ${user._id} - exists: ${assignmentExists}`, constants.LOG_TYPES.TRACE);
                  const existingLeaveAssignment = await doesLeaveAssignmentExistV1({
                    employee,
                    category,
                    cycle,
                    startMonth,
                    endMonth
                  });
                  if (existingLeaveAssignment) {
                    websocketHandler.sendLog(req, `Annually leave assignment already exists for user: ${user._id}`, constants.LOG_TYPES.WARN);
                  } else {
                    var ratePerPeriod = leaveTemplateCategory.accrualRatePerPeriod;
                    var balPerMonth = ratePerPeriod / 12;
                    var accruedBalance = 0;
                    var rawBalance = (((12 - currentMonth)) * balPerMonth);

                    // Apply pro-rating for new joiners in current month (for the first month portion)
                    if (isNewJoiner && userAppointment?.joiningDate) {
                      const joiningDay = new Date(userAppointment.joiningDate).getDate();
                      const firstMonthAccrual = calculateProRatedAccrual(balPerMonth, joiningDay, proRateSetting, cutoffDay);
                      // Remaining months get full accrual, first month is pro-rated
                      const remainingFullMonths = 12 - currentMonth - 1;
                      rawBalance = (remainingFullMonths * balPerMonth) + firstMonthAccrual;
                      websocketHandler.sendLog(req, `Pro-rated annual leave for new joiner - firstMonth: ${firstMonthAccrual}, remainingMonths: ${remainingFullMonths}`, constants.LOG_TYPES.DEBUG);
                    }

                    accruedBalance = Number(rawBalance.toFixed(1));
                    openingBalance = accruedBalance;
                    leaveRemaining = accruedBalance;

                    try {
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
                        company: user.company._id.toString()
                      });
                      websocketHandler.sendLog(req, `Created annual leave assignment for user: ${user._id} with balance: ${accruedBalance}`, constants.LOG_TYPES.INFO);
                    } catch (error) {
                      websocketHandler.sendLog(req, `Error creating annual leave assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
                    }
                  }
                }

                if (accrualPeriod === constants.Leave_Accrual_Period.Semi_Annually) {
                  const periodLength = 6;
                  websocketHandler.sendLog(req, `Processing semi-annual leave for user: ${user._id}`, constants.LOG_TYPES.DEBUG);
                  const existingLeaveAssignment = await doesLeaveAssignmentExistV1({
                    employee,
                    category,
                    cycle,
                    startMonth,
                    endMonth
                  });

                  if (existingLeaveAssignment) {
                    websocketHandler.sendLog(req, `Semi-annual leave assignment already exists for user: ${user._id}`, constants.LOG_TYPES.WARN);
                  } else {
                    const remainingMonths = endMonth - currentMonth;
                    const balPerMonth = leaveTemplateCategory.accrualRatePerPeriod / periodLength;
                    var rawBalance = leaveTemplateCategory.accrualRatePerPeriod * (remainingMonths / periodLength);

                    // Apply pro-rating for new joiners in current month
                    if (isNewJoiner && userAppointment?.joiningDate) {
                      const joiningDay = new Date(userAppointment.joiningDate).getDate();
                      const firstMonthAccrual = calculateProRatedAccrual(balPerMonth, joiningDay, proRateSetting, cutoffDay);
                      const remainingFullMonths = remainingMonths - 1;
                      rawBalance = (remainingFullMonths * balPerMonth) + firstMonthAccrual;
                      websocketHandler.sendLog(req, `Pro-rated semi-annual leave for new joiner - firstMonth: ${firstMonthAccrual}`, constants.LOG_TYPES.DEBUG);
                    }

                    const accruedBalance = Number(rawBalance.toFixed(1));
                    openingBalance = accruedBalance;
                    leaveRemaining = accruedBalance;
                    try {
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
                        company: leaveCategory.company.toString()
                      });
                      websocketHandler.sendLog(req, `Created semi-annual leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
                    } catch (error) {
                      websocketHandler.sendLog(req, `Error creating semi-annual assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
                    }
                  }
                }

                if (accrualPeriod === constants.Leave_Accrual_Period.Bi_Monthly) {
                  const periodLength = 2;
                  const existingLeaveAssignment = await doesLeaveAssignmentExistV1({
                    employee,
                    category,
                    cycle,
                    startMonth,
                    endMonth
                  });
                  if (existingLeaveAssignment) {
                    websocketHandler.sendLog(req, `Bi-monthly leave assignment already exists for user: ${user._id}`, constants.LOG_TYPES.WARN);
                  }
                  else {
                    var remainingMonths = endMonth - currentMonth;
                    const balPerMonth = leaveTemplateCategory.accrualRatePerPeriod / periodLength;
                    var rawBalance = leaveTemplateCategory.accrualRatePerPeriod * (remainingMonths / periodLength);

                    // Apply pro-rating for new joiners in current month
                    if (isNewJoiner && userAppointment?.joiningDate) {
                      const joiningDay = new Date(userAppointment.joiningDate).getDate();
                      const firstMonthAccrual = calculateProRatedAccrual(balPerMonth, joiningDay, proRateSetting, cutoffDay);
                      const remainingFullMonths = remainingMonths - 1;
                      rawBalance = (remainingFullMonths * balPerMonth) + firstMonthAccrual;
                      websocketHandler.sendLog(req, `Pro-rated bi-monthly leave for new joiner - firstMonth: ${firstMonthAccrual}`, constants.LOG_TYPES.DEBUG);
                    }

                    var accruedBalance = Number(rawBalance.toFixed(1));
                    openingBalance = accruedBalance;
                    leaveRemaining = accruedBalance;
                    websocketHandler.sendLog(req, `Processing bi-monthly leave for user: ${user._id}`, constants.LOG_TYPES.DEBUG);
                    try {
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
                        company: user.company._id.toString()
                      });
                      websocketHandler.sendLog(req, `Created bi-monthly leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
                    } catch (error) {
                      websocketHandler.sendLog(req, `Error creating bi-monthly assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
                    }
                  }
                }

                if (accrualPeriod === constants.Leave_Accrual_Period.Quarterly) {
                  const periodLength = 3;
                  const existingLeaveAssignment = await doesLeaveAssignmentExistV1({
                    employee,
                    category,
                    cycle,
                    startMonth,
                    endMonth
                  });

                  if (existingLeaveAssignment) {
                    websocketHandler.sendLog(req, `Quarterly leave assignment already exists for user: ${user._id}`, constants.LOG_TYPES.WARN);
                  } else {
                    var remainingMonths = endMonth - currentMonth;
                    const balPerMonth = leaveTemplateCategory.accrualRatePerPeriod / periodLength;
                    var rawBalance = leaveTemplateCategory.accrualRatePerPeriod * (remainingMonths / periodLength);

                    // Apply pro-rating for new joiners in current month
                    if (isNewJoiner && userAppointment?.joiningDate) {
                      const joiningDay = new Date(userAppointment.joiningDate).getDate();
                      const firstMonthAccrual = calculateProRatedAccrual(balPerMonth, joiningDay, proRateSetting, cutoffDay);
                      const remainingFullMonths = remainingMonths - 1;
                      rawBalance = (remainingFullMonths * balPerMonth) + firstMonthAccrual;
                      websocketHandler.sendLog(req, `Pro-rated quarterly leave for new joiner - firstMonth: ${firstMonthAccrual}`, constants.LOG_TYPES.DEBUG);
                    }

                    var accruedBalance = Number(rawBalance.toFixed(1));
                    openingBalance = accruedBalance;
                    leaveRemaining = accruedBalance;
                    websocketHandler.sendLog(req, `Processing quarterly leave for user: ${user._id}`, constants.LOG_TYPES.DEBUG);

                    try {
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
                        company: user.company._id.toString()
                      });
                      websocketHandler.sendLog(req, `Created quarterly leave assignment for user: ${user._id}`, constants.LOG_TYPES.INFO);
                    } catch (error) {
                      websocketHandler.sendLog(req, `Error creating quarterly assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
                    }
                  }
                }
              }
              catch (error) {
                websocketHandler.sendLog(req, `Error processing leave category ${category} for user ${user._id}: ${error.message}`, constants.LOG_TYPES.ERROR);
              }
            }
          } else {
            websocketHandler.sendLog(req, `No leave template category found for user: ${user._id}`, constants.LOG_TYPES.WARN);
          }
        } else {
          websocketHandler.sendLog(req, `No employee leave assignment found for user: ${user._id}`, constants.LOG_TYPES.WARN);
        }
      } catch (error) {
        websocketHandler.sendLog(req, `Error processing user ${user._id}: ${error.message}`, constants.LOG_TYPES.ERROR);
      }
    }
  } else {
    websocketHandler.sendLog(req, 'No users found for leave assignment', constants.LOG_TYPES.WARN);
  }

  websocketHandler.sendLog(req, 'Completed leave assignment process', constants.LOG_TYPES.INFO);
};

async function doesLeaveAssignmentExistV1({ employee, category, cycle, startMonth, endMonth }) {
  websocketHandler.sendLog(null, `Checking existing assignment v1 - employee: ${employee}, cycle: ${cycle}`, constants.LOG_TYPES.TRACE);
  //console.log('doesLeaveAssignmentExistV1', { employee, category, cycle, startMonth, endMonth });  
  return await LeaveAssigned.findOne({
    employee,
    category,
    startMonth,
    endMonth,
    cycle
  });
}

const doesLeaveAssignmentExist = async (employeeId, cycle, categoryId) => {
  websocketHandler.sendLog(null, `Checking existing assignment - employee: ${employeeId}, cycle: ${cycle}`, constants.LOG_TYPES.TRACE);
  try {
    const existingAssignment = await LeaveAssigned.findOne({
      employee: employeeId,
      cycle: cycle,
      category: categoryId
    });
    return existingAssignment !== null;
  } catch (error) {
    websocketHandler.sendLog(null, `Error checking leave assignment: ${error.message}`, constants.LOG_TYPES.ERROR);
    return false;
  }
};

const createFiscalCycle = async () => {
  const startYear = new Date().getFullYear();
  const startMonth = "JANUARY";
  const endMonth = "DECEMBER";
  const cycle = `${startMonth}_${startYear}-${endMonth}_${startYear}`;
  return cycle;
};

const runRecuringNotifications = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);
    //console.log('Running recurring notifications for date range:', startOfToday, 'to', endOfToday);
    const notifications = await EventNotification.find({
      //isRecurring: true,
      status: 'scheduled',
      date: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });
    if (!notifications?.length) return;

    const company = await Company.findById(notifications[0].company);
    if (!company) return;

    for (const notification of notifications) {
      // Fetch associated users
      const userLinks = await UserNotification.find({ notification: notification._id });
      if (!userLinks?.length) continue;

      for (const userLink of userLinks) {
        const userId = userLink.user;

        const user = await User.findById(userId);
        const userSubordinates = await userSubordinate.find({ subordinateUserId: userId });
        const managers = await User.find({ _id: { $in: userSubordinates.map(s => s.userId) } });

        if (notification.notificationChannel.includes(NotificationChannel.UI)) {
          sendUINotification(req, user, managers, notification?.eventNotificationType?.toString(), notification, company);

        }

        if (notification.notificationChannel.includes(NotificationChannel.EMAIL)) {
          await sendEmailNotifications(user, managers, notification?.eventNotificationType?.toString(), company, notification);
        }

        if (notification.notificationChannel.includes(NotificationChannel.SMS)) {
          //to be implemented
        }

        if (notification.notificationChannel.includes(NotificationChannel.APP)) {
          //to be implemented
        }

        if (notification.notificationChannel.includes(NotificationChannel.WHATSAPP)) {
          //to be implemented
          sendWhatsAppNotification(req, user, managers, notification?.eventNotificationType?.toString(), notification, company);
        }
      }

      //// Update the `date` to next based on recurringFrequency
      if (
        notification.isRecurring &&
        notification.recurringFrequency &&
        typeof notification.recurringFrequency === 'string' &&
        notification.recurringFrequency.trim() !== '') {
        const nextDate = getNextDate(notification.date, notification.recurringFrequency);
        await EventNotification.updateOne({ _id: notification._id }, { date: nextDate });
      }
      else {
        // One-time notification: update status to 'sent'
        await EventNotification.updateOne({ _id: notification._id }, { status: 'sent' });
      }
    }
  } catch (error) {
    console.error('Error in runRecuringNotifications:', error);
  }
}

function getNextDate(currentDate, frequency) {
  const next = new Date(currentDate);
  switch (frequency) {
    case RecurringFrequency.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case RecurringFrequency.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case RecurringFrequency.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case RecurringFrequency.ANNUALLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

const sendUINotification = async (req, user, managerList, notificationTypeId, notification, company) => {
  try {
    let eventNotificationType = null;
    if (!notificationTypeId) {
      eventNotificationType = await EventNotificationType.findById(notificationTypeId);
    }

    const today = new Date();
    let employeeTitle = '';
    let employeeMessage = '';
    let managerTitle = '';
    let managerMessage = '';

    if (eventNotificationType?.name) {
      switch (eventNotificationType.name) {
        case constants.Event_Notification_Type_Status.Birthday:
          employeeTitle = notification.name;
          employeeMessage = notification.description;

          managerTitle = 'Team Member Birthday Reminder';
          managerMessage = `Today is ${user?.firstName} ${user?.lastName}'s birthday. You may want to reach out and wish them a happy birthday!`;
          break;

        case constants.Event_Notification_Type_Status.WorkAnniversary:
          const appointment = await Appointment.findOne({ user: user._id });
          if (!appointment) return;

          const joiningDate = new Date(appointment.joiningDate);
          const years = today.getFullYear() - joiningDate.getFullYear();

          employeeTitle = notification.name;
          employeeMessage = `Dear ${user?.firstName} ${user?.lastName}, congratulations on your ${years} year work anniversary at ${company.companyName}! We appreciate your dedication and contributions!`;

          managerTitle = `Team Member Work Anniversary`;
          managerMessage = `Today marks ${user?.firstName} ${user?.lastName}'s ${years} year work anniversary.`;
          break;

        case constants.Event_Notification_Type_Status.Appraisal:
          employeeTitle = notification.name;
          employeeMessage = notification.description;

          managerTitle = `Appraisal Notification Sent`;
          managerMessage = `The appraisal results for ${user?.firstName} ${user?.lastName} have been shared with them.`;
          break;

        default:
          employeeTitle = notification.name;
          employeeMessage = notification.description;
          managerList = [];
          break;
      }
    } else {
      employeeTitle = notification.name;
      employeeMessage = notification.description;
      managerList = [];
    }

    // Create notification for the employee
    const employeeNotification = {
      name: employeeTitle,
      description: employeeMessage,
      eventNotificationType: eventNotificationType?._id?.toString() ?? null,
      date: new Date(),
      navigationUrl: '',
      isRecurring: false,
      leadTime: 0,
      status: 'unread'
    };

    const employeeReq = {
      ...req,
      body: employeeNotification,
      cookies: {
        userId: user._id.toString(),
        companyId: company._id.toString()
      }
    };

    await eventNotificationController.addNotificationForUser(employeeReq, {}, () => { });
    // Create notifications for each manager
    const managerNotification = {
      name: managerTitle,
      description: managerMessage,
      eventNotificationType: eventNotificationType?._id?.toString() ?? null,
      date: new Date(),
      navigationUrl: '',
      isRecurring: false,
      leadTime: 0,
      status: 'unread'
    };

    for (const manager of managerList) {
      const managerReq = {
        ...req,
        body: managerNotification,
        cookies: {
          userId: manager._id.toString(),
          companyId: company._id.toString()
        }
      };

      // Fire-and-forget
      (async () => {
        try {
          await eventNotificationController.addNotificationForUser(managerReq, {}, () => { });
        } catch (err) {
          console.error(`Error sending UI notification to manager ${manager._id}:`, err.message);
        }
      })();
    }
  } catch (err) {
    console.error("Error in sendUINotification:", err.message);
  }
};


async function sendNotificationToManager(req, notification, userId, company) {
  try {
    const notificationTypesToTrigger = [
      constants.Event_Notification_Type_Status.Birthday,
      constants.Event_Notification_Type_Status.WorkAnniversary,
      constants.Event_Notification_Type_Status.Appraisal
    ];

    const eventNotificationType = await EventNotificationType.findById(notification.eventNotificationType);

    if (!eventNotificationType || !notificationTypesToTrigger.includes(eventNotificationType.name)) return;

    const userSubordinates = await userSubordinate.find({ subordinateUserId: userId });

    if (!userSubordinates || userSubordinates.length === 0) return;

    const subordinateUser = await User.findById(userId);

    let title = '';
    let message = '';

    switch (eventNotificationType.name) {
      case constants.Event_Notification_Type_Status.Birthday:
        title = 'Team Member Birthday Reminder';
        message = `Today is ${subordinateUser?.firstName} ${subordinateUser?.lastName}'s birthday. You may want to reach out and wish them a happy birthday!`;
        break;

      case constants.Event_Notification_Type_Status.WorkAnniversary:
        const appointments = await Appointment.findOne({ user: userId });
        if (!appointments || appointments.length === 0) return;
        const joiningDate = new Date(appointments.joiningDate);
        const today = new Date();
        const years = today.getFullYear() - joiningDate.getFullYear();
        title = `Team Member Work Anniversary`;
        message = `Today marks ${subordinateUser?.firstName} ${subordinateUser?.lastName}'s ${years} year work anniversary.`;
        break;

      case constants.Event_Notification_Type_Status.Appraisal:
        title = `Appraisal Notification Sent`;
        message = `The appraisal results for ${subordinateUser?.firstName} ${subordinateUser?.lastName} have been shared with them.`;
        break;
    }

    const notificationBody = {
      name: title,
      description: message,
      eventNotificationType: eventNotificationType?._id?.toString() || null,
      date: new Date(),
      navigationUrl: '',
      isRecurring: false,
      recurringFrequency: undefined,
      leadTime: 0,
      status: 'unread'
    };

    for (const subordinate of userSubordinates) {
      const managerUser = subordinate?.userId;
      if (!managerUser || managerUser.length === 0) return;
      const managerUserId = managerUser?._id?.toString();
      const notificationReq = {
        ...req,
        body: notificationBody,
        cookies: {
          userId: managerUserId,
          companyId: company?._id?.toString()
        }
      };

      // Fire-and-forget per manager
      (async () => {
        try {
          await eventNotificationController.addNotificationForUser(notificationReq, {}, () => { });
        } catch (err) {
          console.error(`Error sending notification to manager ${managerUserId}:`, err.message);
        }
      })();
    }
  } catch (err) {
    console.error(`Error in sendNotificationToManager:`, err.message);
  }
}

const sendEmailNotifications = async (user, managerList, notificationType, company, notification) => {
  try {
    let eventNotificationType = null;
    if (notificationType) {
      eventNotificationType = await EventNotificationType.findById(notificationType);
      if (!eventNotificationType) return;
    }

    const today = new Date();
    let employeeTemplateConstant;
    let managerTemplateConstant;
    let employeeReplacements = {};
    let managerReplacements = {};

    if (eventNotificationType?.name) {
      switch (eventNotificationType?.name) {
        case constants.Event_Notification_Type_Status.Birthday:
          employeeTemplateConstant = constants.Email_template_constant.Birthday_Email_To_Employee;
          managerTemplateConstant = constants.Email_template_constant.Birthday_Email_To_Manager;
          employeeReplacements = {
            firstName: user.firstName,
            lastName: user.lastName,
            company: company.companyName
          };
          managerReplacements = {
            employeeFirstName: user.firstName,
            employeeLastName: user.lastName,
            company: company.companyName
          };
          break;

        case constants.Event_Notification_Type_Status.WorkAnniversary:
          const appointment = await Appointment.findOne({ user: user._id });
          if (!appointment) return;

          const joiningDate = new Date(appointment.joiningDate);
          const years = today.getFullYear() - joiningDate.getFullYear();

          employeeTemplateConstant = constants.Email_template_constant.Work_Anniversary_Email_To_Employee;
          managerTemplateConstant = constants.Email_template_constant.Work_Anniversary_Email_To_Manager;
          employeeReplacements = {
            firstName: user.firstName,
            lastName: user.lastName,
            years,
            company: company.companyName
          };
          managerReplacements = {
            employeeFirstName: user.firstName,
            employeeLastName: user.lastName,
            years,
            company: company.companyName
          };
          break;

        case constants.Event_Notification_Type_Status.Appraisal:
          employeeTemplateConstant = constants.Email_template_constant.Appraisal_Email_To_Employee;
          managerTemplateConstant = constants.Email_template_constant.Appraisal_Email_To_Manager;
          employeeReplacements = {
            firstName: user.firstName,
            lastName: user.lastName,
            company: company.companyName
          };
          managerReplacements = {
            employeeFirstName: user.firstName,
            employeeLastName: user.lastName,
            company: company.companyName
          };
          break;

        default:
          await sendEmail({
            email: user.email,
            subject: notification.name,
            message: notification.description
          });
          return;
      }
    } else {
      await sendEmail({
        email: user.email,
        subject: notification.name,
        message: notification.description
      });
      return;
    }

    // Send email to the user
    const employeeTemplate = await EmailTemplate.findOne({
      Name: employeeTemplateConstant,
      company: company._id
    });

    if (employeeTemplate && user.email) {
      const employeeMessage = replaceTemplateVariables(employeeTemplate.contentData, employeeReplacements);
      //console.log('employeeMessage', employeeMessage);
      await sendEmail({
        email: user.email,
        subject: employeeTemplate.subject,
        message: employeeMessage
      });
    }

    // Send email to each manager
    const managerTemplate = await EmailTemplate.findOne({
      Name: managerTemplateConstant,
      company: company._id
    });

    if (managerTemplate) {
      for (const manager of managerList) {
        const replacementsWithManagerName = {
          ...managerReplacements,
          firstName: manager.firstName,
          lastName: manager.lastName
        };

        const managerMessage = replaceTemplateVariables(managerTemplate.contentData, replacementsWithManagerName);

        //console.log('managerMessage', managerMessage);

        if (manager.email) {
          await sendEmail({
            email: manager.email,
            subject: managerTemplate.subject,
            message: managerMessage
          });
        }
      }
    }

  } catch (err) {
    console.error("Error sending email notification:", err.message);
  }
};

const replaceTemplateVariables = (template, variables) => {
  let result = template;
  for (const key in variables) {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, variables[key]);
  }
  return result;
};

async function getPeriodRange(currentMonth, accrualPeriod) {
  var startMonth, endMonth, periodLength;
  switch (accrualPeriod) {
    case constants.Leave_Accrual_Period.Monthly:
      startMonth = currentMonth + 1;
      endMonth = startMonth;
      break;

    case constants.Leave_Accrual_Period.Annually:
      startMonth = 1;
      endMonth = 12;
      break;

    case constants.Leave_Accrual_Period.Semi_Annually:
      periodLength = 6;
      break;

    case constants.Leave_Accrual_Period.Quarterly:
      periodLength = 3;
      break;

    case constants.Leave_Accrual_Period.Bi_Monthly:
      periodLength = 2;
      break;
  }

  if (periodLength) {
    const period = Math.ceil((currentMonth + 1) / periodLength);
    startMonth = (period - 1) * periodLength + 1;
    endMonth = Math.min(startMonth + periodLength - 1, 12);
  }
  return { startMonth, endMonth };
}

const sendWhatsAppNotification = async (req, user, managerList, notificationTypeId, notification, company) => {
  console.log('sendWhatsAppNotification called');
  try {
    let eventNotificationType = null;
    if (!notificationTypeId) {
      eventNotificationType = await EventNotificationType.findById(notificationTypeId);
    }

    const today = new Date();
    let employeeTitle = '';
    let employeeMessage = '';
    let managerTitle = '';
    let managerMessage = '';

    if (eventNotificationType?.name) {
      switch (eventNotificationType.name) {
        case constants.Event_Notification_Type_Status.Birthday:
          employeeTitle = notification.name;
          employeeMessage = notification.description;

          managerTitle = 'Team Member Birthday Reminder';
          managerMessage = `Today is ${user?.firstName} ${user?.lastName}'s birthday. You may want to reach out and wish them a happy birthday!`;
          break;

        case constants.Event_Notification_Type_Status.WorkAnniversary:
          const appointment = await Appointment.findOne({ user: user._id });
          if (!appointment) return;

          const joiningDate = new Date(appointment.joiningDate);
          const years = today.getFullYear() - joiningDate.getFullYear();

          employeeTitle = notification.name;
          employeeMessage = `Dear ${user?.firstName} ${user?.lastName}, congratulations on your ${years} year work anniversary at ${company.companyName}! We appreciate your dedication and contributions!`;

          managerTitle = `Team Member Work Anniversary`;
          managerMessage = `Today marks ${user?.firstName} ${user?.lastName}'s ${years} year work anniversary.`;
          break;

        case constants.Event_Notification_Type_Status.Appraisal:
          employeeTitle = notification.name;
          employeeMessage = notification.description;

          managerTitle = `Appraisal Notification Sent`;
          managerMessage = `The appraisal results for ${user?.firstName} ${user?.lastName} have been shared with them.`;
          break;

        default:
          employeeTitle = notification.name;
          employeeMessage = notification.description;
          managerList = [];
          break;
      }
    } else {
      employeeTitle = notification.name;
      employeeMessage = notification.description;
      managerList = [];
    }

    // Send WhatsApp message to the employee
    if (user?.mobile) {
      await whatsappService.sendTemplateMessage({
        recipientNumber: '919973995346',//normalizeIndianMobile(user.mobile),
        templateName: 'generic_template', //'hello_world',//'test_my_work' //generic_template,
        languageCode: 'en',
        headerParams: [employeeTitle],
        bodyParams: [
          user.firstName,
          employeeMessage
        ]
      });
    }

    // ✅ Send to managers
    for (const manager of managerList) {
      if (manager?.mobile) {
        await whatsappService.sendTemplateMessage({
          recipientNumber: normalizeIndianMobile(manager.mobile),
          templateName: 'generic_template', //'hello_world', //'test_my_work', //generic_template
          languageCode: 'en',
          headerParams: [managerTitle],
          bodyParams: [
            manager.manager.firstName,
            managerMessage
          ]
        });
      }
    }
  } catch (err) {
    console.error("Error in sendUINotification:", err.message);
  }
};

function normalizeIndianMobile(mobile) {
  if (!mobile) return null;
  // remove spaces, hyphens, parentheses
  let num = mobile.toString().replace(/\D/g, '');
  // already starts with country code 91
  if (num.startsWith('91') && num.length === 12) {
    return num;
  }
  // starts with 0XXXXXXXXXX
  if (num.startsWith('0') && num.length === 11) {
    return '91' + num.substring(1);
  }
  // plain 10-digit mobile
  if (num.length === 10) {
    return '91' + num;
  }
  // invalid / unsupported format
  return null;
}

/**
 * Check if employee joined in the current month
 * @param {Date} joiningDate - Employee's joining date
 * @returns {boolean} - True if joined in current month
 */
function isJoinedInCurrentMonth(joiningDate) {
  if (!joiningDate) return false;
  const today = new Date();
  const joining = new Date(joiningDate);
  return joining.getMonth() === today.getMonth() && joining.getFullYear() === today.getFullYear();
}

/**
 * Calculate pro-rated accrual for new joiners based on the setting
 * @param {number} baseAccrual - Base accrual rate per period
 * @param {number} joiningDay - Day of month the employee joined (1-31)
 * @param {string} proRateSetting - 'fixed' or 'pro-ration'
 * @param {number} cutoffDay - Cutoff day for 'fixed' setting (default 15)
 * @returns {number} - Pro-rated accrual amount
 */
function calculateProRatedAccrual(baseAccrual, joiningDay, proRateSetting, cutoffDay = 15) {
  if (!proRateSetting) {
    // Default behavior: full accrual
    return baseAccrual;
  }

  if (proRateSetting === 'fixed') {
    // Fixed cutoff: Employee gets full credit if joined on or before cutoff day, otherwise 0
    return joiningDay <= cutoffDay ? baseAccrual : 0;
  }

  if (proRateSetting === 'pro-ration') {
    // Pro-ration: Calculate based on remaining days in the month
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - joiningDay + 1;
    const proRatedAmount = (baseAccrual * remainingDays) / daysInMonth;
    return Number(proRatedAmount.toFixed(2));
  }

  // Unknown setting: return full accrual
  return baseAccrual;
}

module.exports = {
  doesLeaveAssignmentExist,
  doesLeaveAssignmentExistV1,
  createFiscalCycle,
  assignLeavesByJobs,
  runRecuringNotifications,
  getPeriodRange
};