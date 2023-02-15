const pug = require('pug');
const express = require('express');
const sgMail = require('@sendgrid/mail')
const app = express();

app.set('email', __dirname + '/email');
// set the view engine to pug
app.set('view engine', 'pug');
const sendEmailLog = async options => {
sgMail.setApiKey(process.env.SENDGRID_API_KEY)  
console.log("test12345");
// initialize nodemailer
var html= pug.renderFile(__dirname+'/../email/'+'home.pug' , { managerName:options.data.managerName,name: options.data.name, total: options.data.total,logs:options.data.logs});
const msg = {
    from: 'testingemail112021@gmail.com',
    to: 'apptesting157@gmail.com',
    subject: options.subject,
    html: html
}

console.log(msg);
sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.log(error)
  })
  console.log(process.env.SENDGRID_API_KEY);

};

module.exports = sendEmailLog;