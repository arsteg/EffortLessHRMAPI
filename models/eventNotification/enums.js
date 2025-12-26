const RecurringFrequency = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    ANNUALLY: 'annually'
  };
  
  const NotificationChannel = {
    EMAIL: 'email',
    SMS: 'sms',
    UI: 'ui',
    APP: 'app',
    WHATSAPP: 'whatsapp'
  };  
  
  const NotificationStatus = { // Corrected typo
    UNREAD: 'unread',
    SCHEDULED: 'scheduled',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read' // Corrected typo
  };  
  module.exports = {
    RecurringFrequency,
    NotificationChannel,
    NotificationStatus // Corrected typo
  };
  