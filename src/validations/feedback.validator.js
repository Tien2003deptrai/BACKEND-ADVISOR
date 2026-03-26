const { body } = require("express-validator");

class FeedbackValidator {
    submitFeedbackValidator = [
        body("meeting_id").notEmpty().withMessage("meeting_id is required").isMongoId().withMessage("invalid meeting_id"),
        body("feedback_text").notEmpty().withMessage("feedback_text is required").isString().trim(),
        body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("rating must be between 1 and 5"),
        body("sentiment_label").optional().isIn(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
        body("submitted_at").optional().isISO8601().withMessage("submitted_at must be ISO date"),
    ];

    listFeedbackValidator = [
        body("page").optional().isInt({ min: 1 }).withMessage("page must be an integer >= 1"),
        body("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
        body("class_id").optional().isMongoId().withMessage("invalid class_id"),
        body("student_user_id").optional().isMongoId().withMessage("invalid student_user_id"),
        body("advisor_user_id").optional().isMongoId().withMessage("invalid advisor_user_id"),
        body("sentiment_label").optional().isIn(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
    ];
}

module.exports = new FeedbackValidator();
