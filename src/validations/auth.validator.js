const { body } = require("express-validator");

class AuthValidator {
    registerValidator = [
        body("name").notEmpty().withMessage("name is required").trim(),
        body("username").optional().isString().trim().isLength({ min: 3 }).withMessage("username must be at least 3 characters"),
        body("email").notEmpty().withMessage("email is required").isEmail().withMessage("invalid email").normalizeEmail(),
        body("password").notEmpty().withMessage("password is required").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
        body("role").not().exists().withMessage("role is not allowed in register"),
        body("status").not().exists().withMessage("status is not allowed in register"),
    ];

    loginValidator = [
        body("email").notEmpty().withMessage("email is required").isEmail().withMessage("invalid email").normalizeEmail(),
        body("password").notEmpty().withMessage("password is required"),
    ];
}

module.exports = new AuthValidator();
