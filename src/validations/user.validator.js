const { body } = require("express-validator");

class UserValidator {
    createUserValidator = [
        body("profile.full_name")
            .notEmpty()
            .withMessage("profile.full_name is required")
            .isString()
            .trim(),
        body("username")
            .optional()
            .isString()
            .trim()
            .isLength({ min: 3 })
            .withMessage("username must be at least 3 characters"),
        body("email")
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("invalid email")
            .normalizeEmail(),
        body("password")
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 6 })
            .withMessage("password must be at least 6 characters"),
        body("role")
            .notEmpty()
            .withMessage("role is required")
            .isIn(["ADVISOR", "STUDENT"])
            .withMessage("role must be ADVISOR or STUDENT"),
        body("org.department_id").optional().isMongoId().withMessage("invalid org.department_id"),
        body("org.major_id").optional().isMongoId().withMessage("invalid org.major_id"),
        body("org").custom((value, { req }) => {
            const hasDepartmentId = !!req.body?.org?.department_id;
            const hasMajorId = !!req.body?.org?.major_id;
            if (hasDepartmentId !== hasMajorId) {
                throw new Error("org.department_id and org.major_id must be provided together");
            }
            return true;
        }),
        body("student_info.student_code").custom((value, { req }) => {
            if (req.body?.role === "STUDENT" && !value) {
                throw new Error("student_info.student_code is required for STUDENT role");
            }
            return true;
        }),
        body("status").not().exists().withMessage("status is not allowed"),
    ];

    listUsersValidator = [
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
        body("search").optional().isString().trim(),
        body("role").optional().isString().trim(),
        body("status").optional().isString().trim(),
    ];

    getUserInfoValidator = [
        body("user_id").notEmpty().withMessage("user_id is required").isMongoId().withMessage("invalid user_id"),
    ];
}

module.exports = new UserValidator();
