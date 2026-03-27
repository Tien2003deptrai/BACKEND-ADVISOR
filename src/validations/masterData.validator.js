const { body } = require("express-validator");

class MasterDataValidator {
    createDepartmentValidator = [
        body("department_code")
            .notEmpty()
            .withMessage("department_code is required")
            .isString()
            .trim(),
        body("department_name")
            .notEmpty()
            .withMessage("department_name is required")
            .isString()
            .trim(),
    ];

    listDepartmentsValidator = [
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
        body("search").optional().isString().trim(),
    ];

    createMajorValidator = [
        body("major_code")
            .notEmpty()
            .withMessage("major_code is required")
            .isString()
            .trim(),
        body("major_name")
            .notEmpty()
            .withMessage("major_name is required")
            .isString()
            .trim(),
        body("department_id")
            .notEmpty()
            .withMessage("department_id is required")
            .isMongoId()
            .withMessage("invalid department_id"),
    ];

    listMajorsValidator = [
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
        body("search").optional().isString().trim(),
        body("department_id").optional().isMongoId().withMessage("invalid department_id"),
    ];

    createTermValidator = [
        body("term_code")
            .notEmpty()
            .withMessage("term_code is required")
            .isString()
            .trim(),
        body("academic_year")
            .notEmpty()
            .withMessage("academic_year is required")
            .isString()
            .trim(),
        body("term_name")
            .notEmpty()
            .withMessage("term_name is required")
            .isString()
            .trim(),
        body("start_date")
            .notEmpty()
            .withMessage("start_date is required")
            .isISO8601()
            .withMessage("invalid start_date"),
        body("end_date")
            .notEmpty()
            .withMessage("end_date is required")
            .isISO8601()
            .withMessage("invalid end_date"),
        body("status")
            .optional()
            .isIn(["ACTIVE", "INACTIVE"])
            .withMessage("status must be ACTIVE or INACTIVE"),
    ];

    listTermsValidator = [
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
        body("search").optional().isString().trim(),
        body("status").optional().isIn(["ACTIVE", "INACTIVE"]).withMessage("invalid status"),
    ];
}

module.exports = new MasterDataValidator();
