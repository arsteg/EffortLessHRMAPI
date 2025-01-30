const LeaveCategory = require("../models/Leave/LeaveCategoryModel");
const LeaveTemplateCategory = require('../models/Leave/LeaveTemplateCategoryModel');
const EmployeeLeaveAssignment = require('../models/Leave/EmployeeLeaveAssignmentModel');
const User = require('../models/permissions/userModel');
const LeaveAssigned = require("../models/Leave/LeaveAssignedModel");
const catchAsync = require('../utils/catchAsync');
const constants = require('../constants');
assignLeavesByJobs = async (req, res, next) => { 
    const users = await User.find({}); 
    if(users.length > 0)
    {
       for (const user of users) {  
       const employeeLeaveAssignment = await EmployeeLeaveAssignment.findOne({}).where('user').equals(user._id.toString());    
       if(employeeLeaveAssignment)
       {
            const leaveTemplateCategory = await LeaveTemplateCategory.findOne({}).where('leaveTemplate').equals(employeeLeaveAssignment.leaveTemplate.toString());
            if (leaveTemplateCategory) {           
            const leaveCategory =await  LeaveCategory.findById(leaveTemplateCategory.leaveCategory); 
            const cycle = await createFiscalCycle();           
            const employee = user._id.toString();
            const category=leaveCategory._id;
            const type = leaveCategory.leaveAccrualPeriod;
            const createdOn = new Date();
            var startMonth = createdOn.getMonth();               
            var openingBalance = 0;
            const leaveApplied = 0;      
            var leaveRemaining = 0;
            var closingBalance = 0;
            const leaveTaken=0;          
            if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Monthly)
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
                company:user.company._id.toString() // Assuming companyId is stored in cookies
            });
            }
            if(leaveCategory.leaveAccrualPeriod ===  constants.Leave_Accrual_Period.Annually)
            {            
              const endMonth=12;            
              const assignmentExists = await doesLeaveAssignmentExist(employee, cycle, category);   
              if (!assignmentExists) {
              var ratePerPeriod = leaveTemplateCategory.accrualRatePerPeriod;    
              var balPerMonth=ratePerPeriod/12;   
              var accruedBalance=0;             
              accruedBalance=(((12-startMonth)+1)*balPerMonth);                      
              openingBalance=accruedBalance;
              leaveRemaining=accruedBalance;
              startMonth=startMonth+1;
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
                        company:  user.company._id.toString() // Assuming companyId is stored in cookies
                    });
                  } catch (error) {
                      console.error("Error creating leave assignment:", error);
                  }
                }
            }
            if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Semi_Annually)
            {            
            
            const endMonth = startMonth + 6;              
            const accruedBalance= 2;//leaveTemplateCategory.accrualRatePerPeriod;
            console.log("Semi annually called" + "cycle"+cycle+"employee"+employee._id+"category"+category+"type"+type+"createdOn"+createdOn+"startMonth"+startMonth+
            "endMonth"+endMonth+"openingBalance"+openingBalance+"leaveApplied"+leaveApplied+"accruedBalance"+accruedBalance+"leaveRemaining"+leaveRemaining
            +"closingBalance"+ closingBalance +"leaveTaken"+leaveTaken);
            startMonth=startMonth+1;
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
            startMonth=startMonth+1;
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
            if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Bi_Monthly)
            {
              const endMonth=createdOn.getMonth();       
              const accruedBalance=leaveTemplateCategory.accrualRatePerPeriod;  
              startMonth=startMonth+1;     
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
                company: user.company._id.toString() // Assuming companyId is stored in cookies
            });        
            }
            if(leaveCategory.leaveAccrualPeriod === constants.Leave_Accrual_Period.Quaterly)
            {
              const accruedBalance=leaveTemplateCategory.accrualRatePerPeriod;
              const endMonth=createdOn.getMonth();
              endMonth.setMonth(startMonth.getMonth() + 4);
              startMonth=startMonth+1;
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
                company: user.company._id.toString() // Assuming companyId is stored in cookies
            });
            }
          }
        
        }
      }
    } 
      
};

const doesLeaveAssignmentExist = async (employeeId, cycle, categoryId) => {
      try {
          const existingAssignment = await LeaveAssigned.findOne({
              employee: employeeId,
              cycle: cycle,
              category: categoryId
          });
  
          return existingAssignment !== null; // Returns true if a record exists, otherwise false
      } catch (error) {
          console.error("Error checking leave assignment:", error);
          return false; // Return false in case of an error
      }
};
const createFiscalCycle = async () => {
      const startYear = new Date().getFullYear(); // Get the current year
      const startMonth = "JANUARY";
      const endMonth = "DECEMBER";
      
      return `${startMonth}_${startYear}-${endMonth}_${startYear}`;
};
  module.exports = {
    doesLeaveAssignmentExist,
    createFiscalCycle,
    assignLeavesByJobs
    // other methods...
};
  