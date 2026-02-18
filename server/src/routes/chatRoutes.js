const express = require('express');
const { body } = require('express-validator');

const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  [
    body('message')
      .isString()
      .trim()
      .isLength({ min: 1, max: 4000 })
      .withMessage('message must be between 1 and 4000 characters')
  ],
  chatController.chat
);

module.exports = router;
