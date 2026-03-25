const express = require('express');
const authController = require('../controllers/auth.controller');
const authValidator = require('../validations/auth.validator');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.post("/register", authValidator.registerValidator, validate, authController.register);
router.post('/login', authValidator.loginValidator, validate, authController.login);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
