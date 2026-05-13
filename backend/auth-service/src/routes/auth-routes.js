const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const User = require('../models/User'); 
const authController = require('../controller/auth-controller');

router.post('/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .bail()
      .custom(value => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject('E-Mail address already exists!');
          }
        })
      })
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters long.'),
    body('role')
      .isIn(['ADMIN', 'BUSINESS', 'DRIVER'])
  ],
  authController.signup
);

router.post(
  '/login',authController.login
);

module.exports = router;
