const express = require('express');

const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const { chatMessageValidation } = require('../middleware/validators/chatValidators');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  chatMessageValidation,
  chatController.chat
);

module.exports = router;
