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
    Delete_Comment_Notification: "Delete Comment Notification"
    // Add other email templates as needed
  };
  const Leave_Accrual_Period = {
    Monthly: "Monthly",
    Annually: "Annually",
    Semi_Annually: "Semi-Annually",
    Bi_Monthly: "Bi-Monthly",
    Quaterly: "Quaterly"
  };
  
  const COMPANIES = {
    // Define company-specific constants if needed
  };
  
  module.exports = { Email_template_constant, Leave_Accrual_Period };
  