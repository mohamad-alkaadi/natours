const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();
// param middleware function
// it will hold the value of the parameter
router.param('id', tourController.checkId);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
