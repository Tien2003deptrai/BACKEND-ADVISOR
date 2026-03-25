const { body } = require("express-validator");

class MeetingValidator {
    createMeetingValidator = [
        body("student_user_id").notEmpty().withMessage("student_user_id is required").isMongoId(),
        body("advisor_user_id").optional().isMongoId().withMessage("invalid advisor_user_id"),
        body("term_code").optional().isString().trim(),
        body("meeting_time").notEmpty().withMessage("meeting_time is required").isISO8601(),
        body("notes_raw").notEmpty().withMessage("notes_raw is required").isString().trim(),
        body("notes_summary").optional().isString().trim(),
        body("summary_model").optional().isString().trim(),
    ];
}

module.exports = new MeetingValidator();
