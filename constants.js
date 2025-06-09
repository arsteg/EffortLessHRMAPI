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
    Your_Leave_Application_Has_Been_Approved: "Your Leave Application Has Been Approved",
    Employee_Termination: "Termination of Employment",
    Birthday_Email_To_Employee: "Birthday email template to employee",
    Birthday_Email_To_Manager: "Birthday email template to manager",
    Work_Anniversary_Email_To_Employee: "Work anniversary email template to employee",
    Work_Anniversary_Email_To_Manager: "Work anniversary email template to manager",
    Appraisal_Email_To_Employee: "Appraisal notification email template to employee",
    Appraisal_Email_To_Manager: "Appraisal notification email template to manager"
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

  const Subscription_Status = {
    Active: 'active',
    Authenticated: 'authenticated',
    Created: 'created',
    Pending: 'pending',
    Halted: 'halted',
    Cancelled: 'cancelled',
    Paused: 'paused',
    Expired: 'expired',
    Completed: 'completed',
  };

  const Active_Subscription = [Subscription_Status.Active, Subscription_Status.Authenticated, Subscription_Status.Created];
  
  const Leave_Application_Constant = {
    Level_1_Approval_Pending: "Level 1 Approval Pending",
    Level_2_Approval_Pending: "Level 2 Approval Pending",
    Approved: "Approved",
    Cancelled: "Cancelled",
    Rejected: "Rejected"
  };
  const Resignation_Status = {
    Pending: "Pending",
    Completed: "Completed",
    InProgress: "In-Progress",
    Approved: "Approved",    
    Deleted: "Deleted"
  };
  const Termination_status = {
    Pending: "Pending",
    Completed: "Completed",
    Appealed: "Appealed", 
    Deleted: "Deleted",
    Reinstated: "Reinstated"
  };
  const Termination_Appealed_status = {
    Pending: "Pending",
    Rejected: "Rejected",  
    Approved: "Approved", 
  };
  const Payroll_Status = {   
    InProgress: "InProgress",
    OnHold: "OnHold",
    Closed: "Closed"
  };
  const Payroll_User_Status = {   
    InProgress: "Active",
    OnHold: "OnHold",
    Processed: "Processed"
  };
  const Payroll_FNF_Status = {   
    InProgress: "InProgress",
    OnHold: "OnHold",
    Closed: "Closed"
  };
  const Payroll_User_FNF_Status = {   
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
  const APIResponseStatus = {
    Success: "success",
    Failure: "failure",
    Error: "error",
    Warning: "warning",
    Info: "info"
  };
 

  const webSocketContentType = { 
    TEXT: 'text',
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    FILE: 'file',
    JSON: "json",
  };
  const Salaray_Default_Fixed_Allowance = { 
    Basic_Salary: 'Basic Salary',
    HRA: 'HRA'
  };
  const WEB_SOCKET_NOTIFICATION_TYPES = {
    LOG: 'log',
    ALERT: 'alert',
    NOTIFICATION: 'notification',
    SCREENSHOT: 'screenshot',
    CHAT: 'chat'
  };

  const LOG_TYPES = {
    TRACE: 'trace',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
  };
  const Employee_Loan_Advance_status = {
    Disbursed: "Disbursed",
    Requested: "Requested",
    In_Progress: "In Progress", 
    Partially_Cleared: "Partially Cleared",
    Cleared: "Cleared",
  };
  const Payroll_Loan_Advance_status = {
    Disbursement: "Disbursement",
    Repayment: "Repayment",
  };
  const Payroll_FNF_Loan_Advance_status = {
    Partially_Cleared: "Partially Cleared",
    Cleared: "Cleared",
  };
  const Event_Notification_Type_Status = {
    project_assignment: "project_assignment",
    timelog_delete: "timelog_delete",
    loan_advance: "loan_advance",
    task_assignment: "task_assignment",
    manual_time: "manual_time",
    attendance: "attendance",
    leave: "leave",
    separation: "employee_separation",
    role_assignment: "role_assignment",
    Birthday: "birthday",
    WorkAnniversary: "work_anniversary",
    Appraisal: "appraisal",
  }
  module.exports = { Email_template_constant, Leave_Accrual_Period,Leave_Application_Constant,User_Status,Payroll_Status,
    Payroll_User_Status,Payroll_FNF_Status,Salaray_Default_Fixed_Allowance,
    Payroll_User_FNF_Status,payroll_LoanAdvance_Status,Payroll_LoanAdvance_Type, Active_Statuses,APIResponseStatus,SubContainers, 
    Subscription_Status, Active_Subscription, WEB_SOCKET_NOTIFICATION_TYPES, webSocketContentType,LOG_TYPES,
    Resignation_Status,Termination_status ,Termination_Appealed_status,Employee_Loan_Advance_status,Payroll_Loan_Advance_status,Payroll_FNF_Loan_Advance_status,Event_Notification_Type_Status};
  


 