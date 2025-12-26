const express = require('express');
const { body } = require('express-validator');
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const collectionValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Collection name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean')
];

const addItemValidation = [
  body('itemType')
    .isIn(['youtube', 'content', 'file', 'planner'])
    .withMessage('Invalid item type'),
  body('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
];

// Apply auth middleware to all routes
router.use(auth);

// Get all collections for user
// GET /api/collections?page=1&limit=20&search=query
router.get('/', collectionController.getCollections);

// Get collections containing specific item
// GET /api/collections/item/:itemType/:itemId
router.get('/item/:itemType/:itemId', collectionController.getCollectionsForItem);

// Get single collection
// GET /api/collections/:id
router.get('/:id', collectionController.getCollection);

// Get collection with populated item data
// GET /api/collections/:id/items
router.get('/:id/items', collectionController.getCollectionWithItems);

// Create new collection
// POST /api/collections
router.post('/', collectionValidation, collectionController.createCollection);

// Update collection
// PUT /api/collections/:id
router.put('/:id', collectionValidation, collectionController.updateCollection);

// Delete collection
// DELETE /api/collections/:id
router.delete('/:id', collectionController.deleteCollection);

// Add item to collection
// POST /api/collections/:id/items
router.post('/:id/items', addItemValidation, collectionController.addItemToCollection);

// Remove item from collection
// DELETE /api/collections/:id/items/:itemType/:itemId
router.delete('/:id/items/:itemType/:itemId', collectionController.removeItemFromCollection);

module.exports = router;
