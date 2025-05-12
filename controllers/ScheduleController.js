const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const EmployeeLeaveAssignment = require('../models/Leave/EmployeeLeaveAssignmentModel');
const User = require('../models/permissions/userModel');
const LeaveAssigned = require("../models/Leave/LeaveAssignedModel");
const catchAsync = require('../utils/catchAsync');
const constants = require('../constants');
const websocketHandler = require('../utils/websocketHandler');

assignLeavesByJobs = async (req, res, next) => { 
    websocketHandler.sendLog(req, 'Starting leave assignment process', constants.LOG_TYPES.INFO);
   
    const users = await User.find({}); 
    websocketHandler.sendLog(req, `Found ${users.length} users to process`, constants.LOG_TYPES.DEBUG);
    
    if(users.length > 0) {
        for (const user of users) {  
            websocketHandler.sendLog(req, `Processing leave assignment for user: ${user._id}`, constants.LOG_TYPES.TRACE);
            
            const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({})
                .where('user').equals(user._id.toString());    
            
            if(employeeLeaveAssignment) {
                websocketHandler.sendLog(req, `Found leave assignment for user: ${user._id}`, constants.LOG_TYPES.DEBUG);
                
                const leaveTemplateCategory = await LeaveTemplateCategory.findOne({})
                    .where('leaveTemplate').equals(employeeLeaveAssignment.leaveTemplate.toString());
                
                if (leaveTemplateCategory) {           
                    const leaveCategory = await LeaveCategory.findById(leaveTemplateCategory.leaveCategory); 
                    websocketHandler.sendLog(req, `Processing leave category: ${leaveCategory._id} for user: ${user._id}`, constants.LOG_TYPES.TRACE);
                    
                    const cycle = await createFiscalCycle();           
                    const employee = user._id.toString();
                    const category = leaveCategory._id;
                    const type = leaveCategory.leaveAccrualPeriod;
                    const createdOn = new Date();
                    var startMonth = createdOn.getMonth();               
                    var openingBalance = 0;
                    const leaveApplied = 0;      
                    var leaveRemaining = 0;
                    var closingBalance = 0;
                    const leaveTaken = 0;          
                    
                    if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Monthly) {      
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
                    
                    if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Annually) {            
                        const endMonth = 12;            
                        const assignmentExists = await doesLeaveAssignmentExist(employee, cycle, category);   
                        websocketHandler.sendLog(req, `Checking existing annual assignment for user: ${user._id} - exists: ${assignmentExists}`, constants.LOG_TYPES.TRACE);
                        
                        if (!assignmentExists) {
                            var ratePerPeriod = leaveTemplateCategory.accrualRatePerPeriod;    
                            var balPerMonth = ratePerPeriod/12;   
                            var accruedBalance = 0;             
                            accruedBalance = (((12-startMonth)+1)*balPerMonth);                      
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
                    
                    if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Semi_Annually) {            
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
                    
                    if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Bi_Monthly) {
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
                    
                    if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Quaterly) {
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

module.exports = {
    doesLeaveAssignmentExist,
    createFiscalCycle,
    assignLeavesByJobs
};