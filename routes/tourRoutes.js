const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const router = express.Router();
// param middleware function
// it will hold the value of the parameter

// router.param('id', tourController.checkId);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
// we want to protect our routes
// we want to create a middleware function which is gonna run before each of the handlers
// example .get( ***protection function*** tourController.getAllTours)
// we will run the protection function (made up name) then run the handler function ie: getAllTours
// the middleware protection function will be made in the authController
// if the authController.protect returns true the handler function tourController.getAllTours will run after
// if it authController.protect returns false the handler function wont run

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
