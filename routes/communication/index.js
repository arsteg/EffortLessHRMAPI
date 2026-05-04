const express = require('express');
const router = express.Router();

const conversationRouter = require('./conversationRouter');
const messageRouter = require('./messageRouter');
const callRouter = require('./callRouter');
const presenceRouter = require('./presenceRouter');

/**
 * @swagger
 * tags:
 *   - name: Communication
 *     description: EffortlessHRM Communication Platform APIs
 */

// Mount routes
router.use('/conversations', conversationRouter);
router.use('/messages', messageRouter);
router.use('/calls', callRouter);
router.use('/presence', presenceRouter);

module.exports = router;
