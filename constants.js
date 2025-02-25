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
  const User_Status = {   
    Active: "Active",
    Deleted: "Deleted",
    Resigned: "Resigned",
    Terminated: "Terminated",
    Inactive: "Inactive",
    FNF_Attendance_Processed: "FNF Attendance Processed",
    FNF_Payroll_Calculated: "FNF Payroll Calculated",
    FNF_Payment_Processed: "FNF Payment Processed",
    Settled: "Settled"
  };
  const SubContainers = {   
    Profile: "Profile",
    Timelog: "Timelog",
    TaskAttachment: "TaskAttachment",
    ExpenseAttachment: "ExpenseAttachment",
    LeaveAttachment: "LeaveAttachment",
    TaxDeclarionAttachment: "TaxDeclarionAttachment"
  };
  const Active_Statuses = [User_Status.Active, User_Status.Resigned];
  
  const Leave_Application_Constant = {
    Level_1_Approval_Pending: "Level 1 Approval Pending",
    Level_2_Approval_Pending: "Level 2 Approval Pending",
    Approved: "Approved",
    Cancelled: "Cancelled",
    Rejected: "Rejected"
  };
  const Payroll_FNF = {   
    InProgress: "InProgress",
    Pending: "Pending",
    OnHold: "OnHold",
    Processed: "Processed",
    Approved: "Approved",
    Paid: "Paid",
    Cleared: "Cleared",
    Rejected: "Rejected",
    Finilized: "Finilized",
    Exit_Interview_Completed: "Exit Interview Completed"
  };
  const Payroll_User_FNF = {   
    InProgress: "InProgress",
    Pending: "Pending",
    OnHold: "OnHold",
    Processed: "Processed",
    Approved: "Approved",
    Paid: "Paid",
    Cleared: "Cleared",
    Rejected: "Rejected",
    Finilized: "Finilized",
    Exit_Interview_Completed: "Exit Interview Completed"
  };
  const COMPANIES = {
    // Define company-specific constants if needed
  };
  const payroll_LoanAdvance_Status = {   
    Pending: "Pending",
    Partially_Cleared: "Partially Cleared",
    Cleared: "Cleared",
    Deducted: "Deducted"
  };
  const Payroll_LoanAdvance_Type = {   
    Disbursement: "Disbursement",
    Repayment: "Repayment"
  };
  module.exports = { Email_template_constant, Leave_Accrual_Period,Leave_Application_Constant,User_Status,Payroll_FNF,Payroll_User_FNF,payroll_LoanAdvance_Status,Payroll_LoanAdvance_Type, Active_Statuses,SubContainers};
  