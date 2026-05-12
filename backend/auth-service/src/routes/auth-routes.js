const express = require('express');
const router = express.Router();

const authController = require('../controller/auth-controller');

router.get('/signup', authController.signup);
router.get('/login', authController.login);

module.exports = router;
