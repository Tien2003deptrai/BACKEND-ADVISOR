const { body } = require("express-validator");

class AdvisorClassValidator {
    upsertClassValidator = [
        body("advisor_user_id").optional().isMongoId().withMessage("invalid advisor_user_id"),
        body("class_code").notEmpty().withMessage("class_code is required").isString().trim(),
        body("class_name").optional().isString().trim(),
        body("faculty_code").optional().isString().trim(),
        body("program_code").optional().isString().trim(),
        body("cohort_year").optional().isInt({ min: 1900, max: 3000 }).withMessage("cohort_year is invalid"),
        body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
    ];

    getMyClassValidator = [body("advisor_user_id").optional().isMongoId().withMessage("invalid advisor_user_id")];
}

module.exports = new AdvisorClassValidator();

