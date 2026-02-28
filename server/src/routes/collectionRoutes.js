const express = require('express');
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');
const {
  collectionCreateValidation,
  collectionUpdateValidation,
  addItemValidation,
  addPlannerWidgetValidation,
  summarizeDocumentValidation
} = require('../middleware/validators/collectionValidators');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

router.use(auth);

router.get('/', collectionController.getCollections);


router.get('/item/:itemType/:itemId', collectionController.getCollectionsForItem);


router.get('/:id', collectionController.getCollection);


router.get('/:id/items', collectionController.getCollectionWithItems);


router.post('/', collectionCreateValidation, collectionController.createCollection);


router.put('/:id', collectionUpdateValidation, collectionController.updateCollection);


router.delete('/:id', collectionController.deleteCollection);


router.post('/:id/items', addItemValidation, collectionController.addItemToCollection);


router.post('/:id/planner-widgets', addPlannerWidgetValidation, collectionController.addPlannerWidgetToCollection);


router.post(
  '/:id/summarize-document',
  upload.single('file'),
  handleMulterError,
  summarizeDocumentValidation,
  collectionController.summarizeDocumentToCollectionNote
);

router.delete('/:id/items/:itemType/:itemId', collectionController.removeItemFromCollection);

module.exports = router;
