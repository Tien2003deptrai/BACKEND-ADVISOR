const { param, body } = require("express-validator");

class StudentValidator {
    listStudentsValidator = [
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
        body("search").optional().isString().trim(),
        body("class_id").optional().isMongoId().withMessage("invalid class_id"),
        body("advisor_user_id").optional().isMongoId().withMessage("invalid advisor_user_id"),
    ];

    getStudentByIdValidator = [param("id").isMongoId().withMessage("invalid student id")];
}

module.exports = new StudentValidator();

