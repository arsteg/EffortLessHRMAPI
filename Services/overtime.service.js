const PayrollOvertime = require('../models/Payroll/PayrollOvertime.js');
const OvertimeInformation = require('../models/attendance/overtimeInformation');
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel.js");
const Shift = require('../models/attendance/shift');
const PayrollFNFOvertime = require('../models/Payroll/PayrollFNFOvertime.js');
const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');
const mongoose = require('mongoose');
const PayrollGeneralSetting = require("../models/Payroll/PayrollGeneralSettingModel.js");
const moment = require('moment');
const EmployeeSalutatoryDetails = require("../models/Employment/EmployeeSalutatoryDetailsModel");
const {
  calculateIncomeTax,       // Checks if LWF is applicable for the current month
  getTotalTDSEligibleAmount, 
  getTotalMonthlyAllownaceAmount,       // Finds the correct LWF slab and calculates employee/employer contributions
  GetTDSAppicableAmountAfterDeclartion,
  getTotalHRAAmount
} = require('../Services/tds.service');


async function calculateAndStoreOvertime(req, userId, month, year, payrollUserId, isFNF) {
  try {
    websocketHandler.sendLog(req, `🔄 Starting overtime calculation for userId: ${userId}, month: ${month}, year: ${year}, payrollUserId: ${payrollUserId}, isFNF: ${isFNF}`, constants.LOG_TYPES.INFO);

    const monthIndex = parseInt(month, 10);
    if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) {
      websocketHandler.sendLog(req, `❌ Invalid month input: ${month}`, constants.LOG_TYPES.ERROR);
      throw new Error('Month must be a number between 1 and 12');
    }

    const totalDaysInMonth = new Date(year, monthIndex, 0).getDate();
    websocketHandler.sendLog(req, `📅 Total days in month: ${totalDaysInMonth}`, constants.LOG_TYPES.INFO);

    const payrollSettings = await PayrollGeneralSetting.findOne({}).exec();
    websocketHandler.sendLog(req, `⚙️ PayrollGeneralSetting found: ${!!payrollSettings}, isAllowToCalculateOvertime: ${payrollSettings?.isAllowToCalculateOvertime}`, constants.LOG_TYPES.INFO);
    if (!payrollSettings?.isAllowToCalculateOvertime) {
      websocketHandler.sendLog(req, '🚫 Overtime calculation disabled in PayrollGeneralSetting', constants.LOG_TYPES.WARN);
      const payrollOvertimeData = {
        PayrollUser: payrollUserId,
        LateComing: '0',
        EarlyGoing: '0',
        FinalOvertime: '0',
        OvertimeAmount: '0'
      };
      websocketHandler.sendLog(req, '💾 Saving PayrollOvertime with zero values', constants.LOG_TYPES.INFO);
      const payrollOvertime = new PayrollOvertime(payrollOvertimeData);
      await payrollOvertime.save();
      websocketHandler.sendLog(req, `✅ PayrollOvertime saved with zero values for PayrollUser: ${payrollUserId}`, constants.LOG_TYPES.SUCCESS);
      return {
        message: 'Overtime calculation disabled, saved record with zero values',
        data: payrollOvertimeData
      };
    }

    const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId }).exec();
    websocketHandler.sendLog(req, `👤 EmployeeSalutatoryDetails found: ${!!statutoryDetails}, eligibleForOvertime: ${statutoryDetails?.eligibleForOvertime}`, constants.LOG_TYPES.INFO);
    if (!statutoryDetails?.eligibleForOvertime) {
      websocketHandler.sendLog(req, `🚫 User ${userId} is not eligible for overtime`, constants.LOG_TYPES.WARN);
      const startDate = moment(`${year}-${monthIndex}-01`).startOf('month').toDate();
      const endDate = moment(startDate).endOf('month').toDate();
      websocketHandler.sendLog(req, `📆 Fetching overtime records from ${startDate} to ${endDate}`, constants.LOG_TYPES.INFO);

      const overtimeRecords = await OvertimeInformation.find({
      CheckInDate: { $gte: startDate, $lt: endDate },
        User: userId
      }).exec();
      websocketHandler.sendLog(req, `📋 Overtime records fetched: ${overtimeRecords.length}`, constants.LOG_TYPES.INFO);

      let lateCount = 0;
      let earlyCount = 0;
      overtimeRecords.forEach(record => {
        if (record.ShiftTime && record.CheckInTime && record.CheckOutTime) {
          const [shiftStart, shiftEnd] = record.ShiftTime.split(' ');
          const checkInDateTime = new Date(record.CheckInTime);
          const checkOutDateTime = new Date(record.CheckOutTime);

          const shiftStartTime = new Date(checkInDateTime);
          shiftStartTime.setHours(parseInt(shiftStart.split(':')[0]), parseInt(shiftStart.split(':')[1]), 0);

          const shiftEndTime = new Date(checkOutDateTime);
          shiftEndTime.setHours(parseInt(shiftEnd.split(':')[0]), parseInt(shiftEnd.split(':')[1]), 0);

          if (checkInDateTime > shiftStartTime) {
            lateCount++;
            websocketHandler.sendLog(req, `⏰ Late coming detected on ${record.CheckInDate}`, constants.LOG_TYPES.INFO);
          }
          if (checkOutDateTime < shiftEndTime) {
            earlyCount++;
            websocketHandler.sendLog(req, `⏰ Early going detected on ${record.CheckInDate}`, constants.LOG_TYPES.INFO);
          }
        }
      });
      websocketHandler.sendLog(req, `📊 Late count: ${lateCount}, Early count: ${earlyCount}`, constants.LOG_TYPES.INFO);

      const payrollOvertimeData = {
        PayrollUser: payrollUserId,
        LateComing: lateCount.toString(),
        EarlyGoing: earlyCount.toString(),
        FinalOvertime: '0',
        OvertimeAmount: '0'
      };
     websocketHandler.sendLog(req, '💾 Saving PayrollOvertime with zero overtime due to ineligibility', constants.LOG_TYPES.INFO);    const payrollOvertime = new PayrollOvertime(payrollOvertimeData);
      await payrollOvertime.save();
      websocketHandler.sendLog(req, `✅ PayrollOvertime saved for PayrollUser: ${payrollUserId}`, constants.LOG_TYPES.SUCCESS);
      return {
        message: 'User not eligible for overtime, saved record with zero overtime',
        data: payrollOvertimeData
      };
    }

    const startDate = moment(`${year}-${monthIndex}-01`).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();
    websocketHandler.sendLog(req, `📆 Fetching overtime records from ${startDate} to ${endDate}`, constants.LOG_TYPES.INFO);

    const overtimeRecords = await OvertimeInformation.find({
      CheckInDate: { $gte: startDate, $lt: endDate },
      User: userId
    }).exec();
   websocketHandler.sendLog(req, `📋 Overtime records fetched: ${overtimeRecords.length}`, constants.LOG_TYPES.INFO);

    const totalOvertime = overtimeRecords.reduce((sum, record) => {
      const overtimeMinutes = parseFloat(record.OverTime) || 0;
      return sum + overtimeMinutes;
    }, 0);
    websocketHandler.sendLog(req, `⏱️ Total overtime (minutes): ${totalOvertime}`, constants.LOG_TYPES.INFO);

    let lateCount = 0;
    let earlyCount = 0;
    overtimeRecords.forEach(record => {
      if (record.ShiftTime && record.CheckInTime && record.CheckOutTime) {
        const [shiftStart, shiftEnd] = record.ShiftTime.split(' ');
        const checkInDateTime = new Date(record.CheckInTime);
        const checkOutDateTime = new Date(record.CheckOutTime);

        const shiftStartTime = new Date(checkInDateTime);
        shiftStartTime.setHours(parseInt(shiftStart.split(':')[0]), parseInt(shiftStart.split(':')[1]), 0);

        const shiftEndTime = new Date(checkOutDateTime);
        shiftEndTime.setHours(parseInt(shiftEnd.split(':')[0]), parseInt(shiftEnd.split(':')[1]), 0);

        if (checkInDateTime > shiftStartTime) {
          lateCount++;
          websocketHandler.sendLog(req, `⏰ Late coming detected on ${record.CheckInDate}`, constants.LOG_TYPES.INFO);
        }
        if (checkOutDateTime < shiftEndTime) {
          earlyCount++;
          websocketHandler.sendLog(req, `⏰ Early going detected on ${record.CheckInDate}`, constants.LOG_TYPES.INFO);
        }
      }
    });
    websocketHandler.sendLog(req, `📊 Late count: ${lateCount}, Early count: ${earlyCount}`, constants.LOG_TYPES.INFO);

    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId }).exec();
    if (!salaryDetails) {
      websocketHandler.sendLog(req, `❌ No salary details found for userId: ${userId}`, constants.LOG_TYPES.ERROR);
      throw new Error('Salary details not found');
    }

    let totalMonthlyAllownaceAmount = await getTotalMonthlyAllownaceAmount(req, salaryDetails);
    const dailySalary = totalMonthlyAllownaceAmount;
    const salaryPerDay = dailySalary / 30;
    websocketHandler.sendLog(req, `💰 Fixed allowance rate: ${dailySalary}, Daily salary: ${salaryPerDay}`, constants.LOG_TYPES.INFO);

    const shiftData = await Shift.findOne({ user: userId }).exec();
    if (!shiftData) {
      websocketHandler.sendLog(req, `❌ No shift data found for userId: ${userId}`, constants.LOG_TYPES.ERROR);
      throw new Error('Shift data not found');
    }
    const fullDayCreditHours = parseFloat(shiftData.minHoursPerDayToGetCreditForFullDay) || 1;
    websocketHandler.sendLog(req, `⏳ Full day credit hours: ${fullDayCreditHours}`, constants.LOG_TYPES.INFO);

    const salaryPerHour = salaryPerDay / fullDayCreditHours;
    websocketHandler.sendLog(req, `💸 Salary per hour: ${salaryPerHour}`, constants.LOG_TYPES.INFO);
    const overtimePayableSalary = salaryPerHour * (totalOvertime / 60);
    websocketHandler.sendLog(req, `💵 Overtime payable salary: ${overtimePayableSalary}`, constants.LOG_TYPES.INFO);

    const payrollOvertimeData = {
      PayrollUser: payrollUserId,
      LateComing: lateCount.toString(),
      EarlyGoing: earlyCount.toString(),
      FinalOvertime: totalOvertime.toFixed(2),
      OvertimeAmount: overtimePayableSalary.toFixed(2)
    };
    websocketHandler.sendLog(req, '💾 Saving PayrollOvertime data', constants.LOG_TYPES.INFO);

    const payrollOvertime = new PayrollOvertime(payrollOvertimeData);
    await payrollOvertime.save();
    websocketHandler.sendLog(req, `✅ PayrollOvertime saved successfully for PayrollUser: ${payrollUserId}`, constants.LOG_TYPES.SUCCESS);
  } catch (error) {
    console.log(`❌ Overtime calculation failed: ${error.message}`);
    websocketHandler.sendLog(req, `❌ Overtime calculation failed: ${error.message}`, constants.LOG_TYPES.ERROR);
    throw error;
  }
}
async function calculateAndStoreOvertimeForFNF(req, userId, startDate, endDate, payrollFNFUserId) {
  try {
    const logPrefix = `[FNF Overtime]`;
    websocketHandler.sendLog(req, `🔄 Starting FNF overtime calculation for userId: ${userId}, startDate: ${startDate}, endDate: ${endDate}`, constants.LOG_TYPES.INFO);

    // Validate date inputs
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || start > end) {
      console.error(`${logPrefix} ❌ Invalid date range`);
      websocketHandler.sendLog(req, `❌ Invalid date range: ${startDate} - ${endDate}`, constants.LOG_TYPES.ERROR);
      throw new Error('Invalid startDate or endDate');
    }

    // Check if overtime calculation is allowed
    const payrollSettings = await PayrollGeneralSetting.findOne({}).exec();
    if (!payrollSettings?.isAllowToCalculateOvertime) {
      websocketHandler.sendLog(req, '🚫 Overtime calculation disabled in PayrollGeneralSetting', constants.LOG_TYPES.WARN);
      console.warn(`${logPrefix} 🚫 Overtime calculation disabled`);

      const payrollOvertimeData = {
        PayrollFNFUser: payrollFNFUserId,
        LateComing: '0',
        EarlyGoing: '0',
        FinalOvertime: '0',
        OvertimeAmount: '0'
      };
      const payrollOvertime = new PayrollFNFOvertime(payrollOvertimeData);
      await payrollOvertime.save();
      return {
        message: 'Overtime calculation disabled, saved record with zero values',
        data: payrollOvertimeData
      };
    }

    // Check employee eligibility
    const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId }).exec();
    const eligibleForOvertime = statutoryDetails?.eligibleForOvertime || false;
    // Fetch overtime records
    const overtimeRecords = await OvertimeInformation.find({
      CheckInDate: { $gte: start, $lte: end },
      User: userId
    }).exec();
    let totalOvertime = 0;
    let lateCount = 0;
    let earlyCount = 0;

    overtimeRecords.forEach(record => {
      const overtimeMinutes = parseFloat(record.OverTime) || 0;
      totalOvertime += overtimeMinutes;

      if (record.ShiftTime && record.CheckInTime && record.CheckOutTime) {
        const [shiftStart, shiftEnd] = record.ShiftTime.split(' ');
        const checkIn = new Date(record.CheckInTime);
        const checkOut = new Date(record.CheckOutTime);

        const shiftStartTime = new Date(checkIn);
        shiftStartTime.setHours(...shiftStart.split(':').map(Number), 0);

        const shiftEndTime = new Date(checkOut);
        shiftEndTime.setHours(...shiftEnd.split(':').map(Number), 0);

        if (checkIn > shiftStartTime) {
          lateCount++;
        }
        if (checkOut < shiftEndTime) {
          earlyCount++;
         }
      }
    });

 
    let finalOvertime = eligibleForOvertime ? totalOvertime : 0;
    let overtimeAmount = '0.00';

    if (eligibleForOvertime && finalOvertime > 0) {
      const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId }).exec();
      if (!salaryDetails) {
        console.error(`${logPrefix} ❌ No salary details found`);
        throw new Error('Salary details not found');
      }    
      const totalMonthlyAllownaceAmount = await getTotalMonthlyAllownaceAmount(req, salaryDetails);
      const salaryPerDay = totalMonthlyAllownaceAmount / 30;
      const shiftData = await Shift.findOne({ user: userId }).exec();
      if (!shiftData) {
        console.error(`${logPrefix} ❌ No shift data found`);
        throw new Error('Shift data not found');
      }
      const fullDayCreditHours = parseFloat(shiftData.minHoursPerDayToGetCreditForFullDay) || 1;
      const salaryPerHour = salaryPerDay / fullDayCreditHours;   
      overtimeAmount = (salaryPerHour * (finalOvertime / 60)).toFixed(2);
   }

    const payrollOvertimeData = {
      PayrollFNFUser: payrollFNFUserId,
      LateComing: lateCount.toString(),
      EarlyGoing: earlyCount.toString(),
      FinalOvertime: finalOvertime.toFixed(2),
      OvertimeAmount: overtimeAmount
    };

    const payrollOvertime = new PayrollFNFOvertime(payrollOvertimeData);
    await payrollOvertime.save();
    websocketHandler.sendLog(req, `✅ FNF PayrollOvertime saved for userId: ${userId}`, constants.LOG_TYPES.SUCCESS);
    return {
      message: 'FNF overtime calculation completed successfully',
      data: payrollOvertimeData
    };

  } catch (error) {
    console.error(`[FNF Overtime] ❌ Error occurred:`, error);
    websocketHandler.sendLog(req, `❌ FNF Overtime calculation failed: ${error.message}`, constants.LOG_TYPES.ERROR);
    throw error;
  }
}


module.exports = {
    calculateAndStoreOvertime,
    calculateAndStoreOvertimeForFNF    
  };