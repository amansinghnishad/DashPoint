const express = require('express');

const auth = require('../middleware/auth');
const focusController = require('../controllers/focusController');

const router = express.Router();

router.use(auth);

router.get('/', focusController.getFocusSummary);

module.exports = router;
