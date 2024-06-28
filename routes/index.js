var express = require('express');
const authController = require('./../controllers/authController');
const cron = require("node-cron");
var routes = express();
app = express();
routes.get('/', (req, res, next) => {
  res.render('welcome');
})

/*

var task = cron.schedule('* * * * *', () =>  {
authController.sendLog();
  }, {
    scheduled: true
   // timezone: "America/Sao_Paulo"
  });
  
  task.start();
  */
  
 
module.exports = routes;