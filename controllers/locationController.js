const catchAsync = require('../utils/catchAsync');
const statesOfIndia = require('../data/statesOfIndia.json');

exports.getAllStates = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: statesOfIndia
  });
});
