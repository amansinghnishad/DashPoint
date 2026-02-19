const express = require('express');

const auth = require('../middleware/auth');
const plannerWidgetController = require('../controllers/plannerWidgetController');
const {
  createValidation,
  updateValidation,
  listValidation,
  idValidation
} = require('../middleware/validators/plannerWidgetValidators');

const router = express.Router();

router.use(auth);

router.get(
  '/',
  listValidation,
  plannerWidgetController.getAllPlannerWidgets
);

router.get(
  '/:id',
  idValidation,
  plannerWidgetController.getPlannerWidgetById
);

router.post('/', createValidation, plannerWidgetController.createPlannerWidget);
router.put('/:id', updateValidation, plannerWidgetController.updatePlannerWidget);
router.delete(
  '/:id',
  idValidation,
  plannerWidgetController.deletePlannerWidget
);

module.exports = router;
