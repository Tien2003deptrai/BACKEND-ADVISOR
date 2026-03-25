const { body } = require("express-validator");

class UserValidator {
    listUsersValidator = [
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
        body("search").optional().isString().trim(),
        body("role").optional().isString().trim(),
        body("status").optional().isString().trim(),
    ];
}

module.exports = new UserValidator();

