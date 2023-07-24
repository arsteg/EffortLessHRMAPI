// loggingMiddleware.js

const logger = require('./logger');

function loggingMiddleware(req, res, next) {
  const { method, originalUrl, query, body, ip } = req;
  const userAgent = req.get('user-agent');
  
  const user = req.cookies?.userId;
  const company = req.cookies?.companyId;
  
  const logData = {
    method,
    url: originalUrl,
    query,
    body,
    ip,
    userAgent,
    user,
    company,
  };
  // Log the request details
  logger.info(logData);
  next();
}
module.exports = loggingMiddleware;
