const { body } = require("express-validator");

class AcademicValidator {
    submitAcademicValidator = [
        body("student_user_id").optional().isMongoId().withMessage("invalid student_user_id"),
        body("term_code").notEmpty().withMessage("term_code is required").isString().trim(),
        body("gpa_prev_sem").optional().isFloat({ min: 0, max: 4 }).withMessage("gpa_prev_sem must be between 0 and 4"),
        body("gpa_current").optional().isFloat({ min: 0, max: 4 }).withMessage("gpa_current must be between 0 and 4"),
        body("num_failed").optional().isInt({ min: 0 }).withMessage("num_failed must be >= 0"),
        body("attendance_rate")
            .optional()
            .isFloat({ min: 0, max: 100 })
            .withMessage("attendance_rate must be between 0 and 100"),
        body("shcvht_participation").optional().isInt({ min: 0 }).withMessage("shcvht_participation must be >= 0"),
        body("study_hours").optional().isFloat({ min: 0 }).withMessage("study_hours must be >= 0"),
        body("motivation_score")
            .optional()
            .isInt({ min: 1, max: 5 })
            .withMessage("motivation_score must be between 1 and 5"),
        body("stress_score").optional().isInt({ min: 1, max: 5 }).withMessage("stress_score must be between 1 and 5"),
        body("sentiment_score")
            .optional()
            .isFloat({ min: 0, max: 1 })
            .withMessage("sentiment_score must be between 0 and 1"),
        body("recorded_at").optional().isISO8601().withMessage("recorded_at must be ISO date"),
    ];
}

module.exports = new AcademicValidator();
