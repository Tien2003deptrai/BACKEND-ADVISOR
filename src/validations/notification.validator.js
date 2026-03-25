const { body } = require("express-validator");

class NotificationValidator {
    listNotificationsValidator = [
        body("recipient_user_id").optional().isMongoId().withMessage("invalid recipient_user_id"),
        body("is_read").optional().isBoolean().withMessage("is_read must be boolean"),
        body("type")
            .optional()
            .isIn(["RISK_ALERT", "SENTIMENT_ALERT", "ANOMALY_ALERT", "SYSTEM"]),
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("limit must be between 1 and 100"),
    ];

    generateAlertsValidator = [
        body("student_user_id").optional().isMongoId().withMessage("invalid student_user_id"),
        body("advisor_user_id").optional().isMongoId().withMessage("invalid advisor_user_id"),
        body("risk_threshold")
            .optional()
            .isFloat({ min: 0, max: 1 })
            .withMessage("risk_threshold must be between 0 and 1"),
        body("negative_days")
            .optional()
            .isInt({ min: 1, max: 180 })
            .withMessage("negative_days must be between 1 and 180"),
    ];
}

module.exports = new NotificationValidator();
