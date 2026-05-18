const express = require('express');
const { query } = require('express-validator');

const auth = require('../middleware/auth');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.use(auth);

router.get(
  '/',
  [
    query('q')
      .isString()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage('q must be between 2 and 120 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage('limit must be an integer between 1 and 12')
      .toInt()
  ],
  searchController.searchAll
);

module.exports = router;
