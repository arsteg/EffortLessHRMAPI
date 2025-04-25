const sgMail = require('@sendgrid/mail')
const sendEmail = async options => {
 
sgMail.setApiKey(process.env.SENDGRID_API_KEY)  
  // 1) Define the email options  
  const msg = {
    from: 'hrmeffortless@gmail.com',
    to: options.email,
    subject: options.subject,
    html: options.message
}
  // 2) Actually send the email
 try {
  const response = await sgMail.send(msg);
  console.log('Email sent successfully.');
  console.log('Status Code:', response[0].statusCode);
} catch (error) {
  console.error('Error sending email:', error.message);
  // res.status(500).json({
  //   status: constants.APIResponseStatus.Failure,
  //   message: 'Failed to send email.',
  //   error: error.message,
  // });
}
};

module.exports = sendEmail;
