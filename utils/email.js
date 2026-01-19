const sgMail = require('@sendgrid/mail');
const { EmailClient } = require('@azure/communication-email');

/**
 * Sends an email using either Azure Communication Services or SendGrid.
 * Configured via EMAIL_PROVIDER environment variable ('azure' or 'sendgrid').
 * 
 * @param {Object} options - Email options (email, subject, message)
 */
const sendEmail = async options => {
  const provider = process.env.EMAIL_PROVIDER || 'sendgrid';
console.log(`Using email provider: ${provider}`);
  if (provider === 'azure') {
    // Azure Email Implementation
    const connectionString = process.env.AZURE_EMAIL_CONNECTION_STRING;
    const client = new EmailClient(connectionString);
console.log('options.email', options.email);
    const emailMessage = {
      senderAddress: process.env.AZURE_SENDER_EMAIL || "DoNotReply@fffe79e3-d2e5-44b7-8e78-a140489d30ff.azurecomm.net",
      content: {
        subject: options.subject,
        plainText: options.message.replace(/<[^>]*>?/gm, ''), // Simple HTML strip for plain text
        html: options.message
      },
      recipients: {
        to: [{ address: options.email }]
      }
    };

    try {
      const poller = await client.beginSend(emailMessage);
      const result = await poller.pollUntilDone();
      console.log('Azure Email sent successfully. Id:', result.id);
    } catch (error) {
      console.error('Error sending email via Azure:', error.message);
    }
  } else {
    // SendGrid Implementation (Default)
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      from: process.env.SENDGRID_SENDER_EMAIL || 'info@arsteg.com',
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    try {
      const response = await sgMail.send(msg);
      console.log('SendGrid Email sent successfully.');
      console.log('Status Code:', response[0].statusCode);
    } catch (error) {
      console.error('Error sending email via SendGrid:', error.message);
    }
  }
};

module.exports = sendEmail;

