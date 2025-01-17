const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//but in authentication we have to break the REST rules
router.post('/signup', authController.signup);
// we use post because we want to pass the login credentials
router.post('/login', authController.login);

//here we apply the REST philosophy that the where the name of the url has nothing to do with the action performed
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
