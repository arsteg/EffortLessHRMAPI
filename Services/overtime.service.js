const PayrollOvertime = require('../models/Payroll/PayrollOvertime');
const OvertimeInformation = require('../models/attendance/overtimeInformation');
const EmployeeSalaryDetails = require("../models/Employment/EmployeeSalaryDetailsModel.js");
const Shift = require('../models/attendance/shift');

const websocketHandler = require('../utils/websocketHandler');
const constants = require('../constants');
const mongoose = require('mongoose');
const moment = require('moment');
const PayrollGeneralSetting = require("../models/Payroll/PayrollGeneralSettingModel.js");
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
    // Log the start of overtime calculation
    websocketHandler.sendLog(req, `🔄 Starting overtime calculation for userId: ${userId}, month: ${month}, year: ${year}, payrollUserId: ${payrollUserId}, isFNF: ${isFNF}`, constants.LOG_TYPES.INFO);

    // Validate and parse month input
    const monthIndex = parseInt(month, 10);
    if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) {
      websocketHandler.sendLog(req, `❌ Invalid month input: ${month}`, constants.LOG_TYPES.ERROR);
      throw new Error('Month must be a number between 1 and 12');
    }

    // Calculate total days in the month
    const totalDaysInMonth = new Date(year, monthIndex, 0).getDate();
    websocketHandler.sendLog(req, `📅 Total days in month: ${totalDaysInMonth}`, constants.LOG_TYPES.INFO);

    // Check if overtime calculation is allowed in PayrollGeneralSetting
    const payrollSettings = await PayrollGeneralSetting.findOne({}).exec();
    websocketHandler.sendLog(req, `⚙️ PayrollGeneralSetting found: ${!!payrollSettings}, isAllowToCalculateOvertime: ${payrollSettings?.isAllowToCalculateOvertime}`, constants.LOG_TYPES.INFO);
    if (!payrollSettings?.isAllowToCalculateOvertime) {
      // Log that overtime calculation is disabled
      websocketHandler.sendLog(req, '🚫 Overtime calculation disabled in PayrollGeneralSetting', constants.LOG_TYPES.WARN);
      // Prepare record with zero values
      const payrollOvertimeData = {
        PayrollUser: payrollUserId,
        LateComing: '0',
        EarlyGoing: '0',
        FinalOvertime: '0',
        OvertimeAmount: '0'
      };
      websocketHandler.sendLog(req, '💾 Saving PayrollOvertime with zero values', constants.LOG_TYPES.INFO);
      // Save the record
      const payrollOvertime = new PayrollOvertime(payrollOvertimeData);
      await payrollOvertime.save();
      websocketHandler.sendLog(req, `✅ PayrollOvertime saved with zero values for PayrollUser: ${payrollUserId}`, constants.LOG_TYPES.SUCCESS);
      // Return result
      return {
        message: 'Overtime calculation disabled, saved record with zero values',
        data: payrollOvertimeData
      };
    }

    // Check if user is eligible for overtime in EmployeeSalutatoryDetails
    const statutoryDetails = await EmployeeSalutatoryDetails.findOne({ user: userId }).exec();
    websocketHandler.sendLog(req, `👤 EmployeeSalutatoryDetails found: ${!!statutoryDetails}, eligibleForOvertime: ${statutoryDetails?.eligibleForOvertime}`, constants.LOG_TYPES.INFO);
    if (!statutoryDetails?.eligibleForOvertime) {
      // Log that user is not eligible
      websocketHandler.sendLog(req, `🚫 User ${userId} is not eligible for overtime`, constants.LOG_TYPES.WARN);
      // Define date range for the month
      const startDate = moment(`${year}-${monthIndex}-01`).startOf('month').toDate();
      const endDate = moment(startDate).endOf('month').toDate();
      websocketHandler.sendLog(req, `📆 Fetching overtime records from ${startDate} to ${endDate}`, constants.LOG_TYPES.INFO);

      // Fetch overtime records
      const overtimeRecords = await OvertimeInformation.find({
        CheckInDate: {
          $gte: startDate,
          $lt: endDate
        },
        User: userId
      }).exec();
      websocketHandler.sendLog(req, `📋 Overtime records fetched: ${overtimeRecords.length}`, constants.LOG_TYPES.INFO);

      // Calculate LateComing and EarlyGoing
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

      // Prepare record with zero overtime
      const payrollOvertimeData = {
        PayrollUser: payrollUserId,
        LateComing: lateCount.toString(),
        EarlyGoing: earlyCount.toString(),
        FinalOvertime: '0',
        OvertimeAmount: '0'
      };
      websocketHandler.sendLog(req, '💾 Saving PayrollOvertime with zero overtime due to ineligibility', constants.LOG_TYPES.INFO);
      // Save the record
      const payrollOvertime = new PayrollOvertime(payrollOvertimeData);
      await payrollOvertime.save();
      websocketHandler.sendLog(req, `✅ PayrollOvertime saved for PayrollUser: ${payrollUserId}`, constants.LOG_TYPES.SUCCESS);
      // Return result
      return {
        message: 'User not eligible for overtime, saved record with zero overtime',
        data: payrollOvertimeData
      };
    }

    // Proceed with full overtime calculation
    const startDate = moment(`${year}-${monthIndex}-01`).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();
    websocketHandler.sendLog(req, `📆 Fetching overtime records from ${startDate} to ${endDate}`, constants.LOG_TYPES.INFO);

    // Fetch overtime records
    const overtimeRecords = await OvertimeInformation.find({
      CheckInDate: {
        $gte: startDate,
        $lt: endDate
      },
      User: userId
    }).exec();
    websocketHandler.sendLog(req, `📋 Overtime records fetched: ${overtimeRecords.length}`, constants.LOG_TYPES.INFO);

    // Calculate total overtime in minutes
    const totalOvertime = overtimeRecords.reduce((sum, record) => {
      const overtimeMinutes = parseFloat(record.OverTime) || 0;
      return sum + overtimeMinutes;
    }, 0);
    websocketHandler.sendLog(req, `⏱️ Total overtime (minutes): ${totalOvertime}`, constants.LOG_TYPES.INFO);

    // Calculate LateComing and EarlyGoing
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

    // Fetch salary details
    const salaryDetails = await EmployeeSalaryDetails.findOne({ user: userId }).exec();
    if (!salaryDetails) {
      websocketHandler.sendLog(req, `❌ No salary details found for userId: ${userId}`, constants.LOG_TYPES.ERROR);
      throw new Error('Salary details not found');
    }

    // Calculate monthly allowance
    let totalMonthlyAllownaceAmount = await getTotalMonthlyAllownaceAmount(req, salaryDetails);
    const dailySalary = totalMonthlyAllownaceAmount;
    const salaryPerDay = dailySalary / 30;
    websocketHandler.sendLog(req, `💰 Fixed allowance rate: ${dailySalary}, Daily salary: ${salaryPerDay}`, constants.LOG_TYPES.INFO);

    // Fetch shift data
    const shiftData = await Shift.findOne({ user: userId }).exec();
    if (!shiftData) {
      websocketHandler.sendLog(req, `❌ No shift data found for userId: ${userId}`, constants.LOG_TYPES.ERROR);
      throw new Error('Shift data not found');
    }
    const fullDayCreditHours = parseFloat(shiftData.minHoursPerDayToGetCreditForFullDay) || 1;
    websocketHandler.sendLog(req, `⏳ Full day credit hours: ${fullDayCreditHours}`, constants.LOG_TYPES.INFO);

    // Calculate overtime payable salary
    const salaryPerHour = salaryPerDay / fullDayCreditHours;
    websocketHandler.sendLog(req, `💸 Salary per hour: ${salaryPerHour}`, constants.LOG_TYPES.INFO);
    const overtimePayableSalary = salaryPerHour * (totalOvertime / 60);
    websocketHandler.sendLog(req, `💵 Overtime payable salary: ${overtimePayableSalary}`, constants.LOG_TYPES.INFO);

    // Prepare overtime data
    const payrollOvertimeData = {
      PayrollUser: payrollUserId,
      LateComing: lateCount.toString(),
      EarlyGoing: earlyCount.toString(),
      FinalOvertime: totalOvertime.toFixed(2),
      OvertimeAmount: overtimePayableSalary.toFixed(2)
    };
    websocketHandler.sendLog(req, '💾 Saving PayrollOvertime data', constants.LOG_TYPES.INFO);

    // Save the record
    const payrollOvertime = new PayrollOvertime(payrollOvertimeData);
    await payrollOvertime.save();
    websocketHandler.sendLog(req, `✅ PayrollOvertime saved successfully for PayrollUser: ${payrollUserId}`, constants.LOG_TYPES.SUCCESS);

    
  } catch (error) {
    // Log error
    websocketHandler.sendLog(req, `❌ Overtime calculation failed: ${error.message}`, constants.LOG_TYPES.ERROR);
    throw error;
  }
}
module.exports = {
    calculateAndStoreOvertime      
  };