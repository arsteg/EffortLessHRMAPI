const express = require('express');
const timeLogController = require('../controllers/timeLogController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/getTimeLogs',authController.protect,timeLogController.getTimeLogs);

router
  .route('/')
  .get(authController.protect,timeLogController.getLog)
  .post(authController.protect,timeLogController.addLog);   
  router.post('/getLogsWithImages',authController.protect,timeLogController.getLogsWithImages);  

module.exports = router;