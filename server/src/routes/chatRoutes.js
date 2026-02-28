const express = require('express');

const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const {
  chatMessageValidation,
  actionItemExtractValidation,
  actionItemApproveValidation
} = require('../middleware/validators/chatValidators');

const router = express.Router();

router.use(auth);

router.post(
  '/action-items/extract',
  actionItemExtractValidation,
  chatController.extractActionItems
);

router.post(
  '/action-items/approve',
  actionItemApproveValidation,
  chatController.approveActionItems
);

router.post(
  '/',
  chatMessageValidation,
  chatController.chat
);

module.exports = router;
