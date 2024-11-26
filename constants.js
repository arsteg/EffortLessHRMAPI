var mongoose = require('mongoose');
// constants.js
const Email_template_constant = {
    UPDATE_PROFILE: "Update Your Profile1",
    Forgot_Password: "Forgot Password",
    DELETE_TASK: "Delete Task",
    Update_Task_Notification: "Update Task Notification",
    Task_Assigned: "Task Assigned",
    Task_Unassigned: "Task Unassigned",
    Comment_Added_Notification: "Comment Added Notification",
    Delete_Comment_Notification: "Delete Comment Notification",
    Confirmation_Of_Employee_Tax_Declaration_Submission: "Confirmation of Employee Tax Declaration Submission",
    Employee_Tax_Declaration_Submission_Notification_For_Employee: "Employee Tax Declaration Submission Notification For Employee",
    LoanAdvance_Disbursement_Notification: "Loan Advance Disbursement Notification",
    Attendance_Processing_Update: "Attendance Processing Update",
    Leave_Application_Received_Confiration: "Leave Application Received Confiration",
    CancelReject_Request_Leave_Application: "Leave Application Rejected or Canceled",
    Leave_Application_Approval_Request: "Approval Request Leave Application",
    Your_Leave_Application_Has_Been_Approved: "Your Leave Application Has Been Approved"
    // Add other email templates as needed
  };
  const Leave_Accrual_Period = {
    Monthly: "Monthly",
    Annually: "Annually",
    Semi_Annually: "Semi-Annually",
    Bi_Monthly: "Bi-Monthly",
    Quaterly: "Quaterly"
  };
  const Leave_Application_Constant = {
    Level_1_Approval_Pending: "Level 1 Approval Pending",
    Level_2_Approval_Pending: "Level 2 Approval Pending",
    Approved: "Approved",
    Cancelled: "Cancelled",
    Rejected: "Rejected"
  };
  const COMPANIES = {
    // Define company-specific constants if needed
  };
  
  module.exports = { Email_template_constant, Leave_Accrual_Period,Leave_Application_Constant };
  