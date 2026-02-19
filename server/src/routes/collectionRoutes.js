const express = require('express');
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');
const {
  collectionCreateValidation,
  collectionUpdateValidation,
  addItemValidation,
  addPlannerWidgetValidation
} = require('../middleware/validators/collectionValidators');

const router = express.Router();

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
router.post('/', collectionCreateValidation, collectionController.createCollection);

// Update collection
// PUT /api/collections/:id
router.put('/:id', collectionUpdateValidation, collectionController.updateCollection);

// Delete collection
// DELETE /api/collections/:id
router.delete('/:id', collectionController.deleteCollection);

// Add item to collection
// POST /api/collections/:id/items
router.post('/:id/items', addItemValidation, collectionController.addItemToCollection);

// Create a planner widget and add it to a collection
// POST /api/collections/:id/planner-widgets
router.post('/:id/planner-widgets', addPlannerWidgetValidation, collectionController.addPlannerWidgetToCollection);

// Remove item from collection
// DELETE /api/collections/:id/items/:itemType/:itemId
router.delete('/:id/items/:itemType/:itemId', collectionController.removeItemFromCollection);

module.exports = router;
