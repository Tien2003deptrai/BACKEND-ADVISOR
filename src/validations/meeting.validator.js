const { body } = require("express-validator");

class MeetingValidator {
    createMeetingValidator = [
        body("class_id").notEmpty().withMessage("class_id is required").isMongoId(),
        body("student_user_ids")
            .isArray({ min: 1 })
            .withMessage("student_user_ids must be a non-empty array"),
        body("student_user_ids.*").isMongoId().withMessage("invalid student_user_id"),
        body("advisor_user_id").optional().isMongoId().withMessage("invalid advisor_user_id"),
        body("term_id").optional().isMongoId().withMessage("invalid term_id"),
        body("meeting_time").notEmpty().withMessage("meeting_time is required").isISO8601(),
        body("meeting_end_time")
            .notEmpty()
            .withMessage("meeting_end_time is required")
            .isISO8601()
            .withMessage("meeting_end_time must be ISO date")
            .custom((value, { req }) => {
                const start = new Date(req.body.meeting_time);
                const end = new Date(value);
                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;
                if (end <= start) {
                    throw new Error("meeting_end_time must be after meeting_time");
                }
                return true;
            }),
        body("notes_raw")
            .notEmpty()
            .withMessage("notes_raw is required")
            .isString()
            .withMessage("notes_raw must be a string")
            .trim()
            .isLength({ min: 30 })
            .withMessage("notes_raw must be at least 30 characters long"),
        body("notes_summary").optional().isString().trim(),
        body("summary_model").optional().isString().trim(),
    ];
}

module.exports = new MeetingValidator();
