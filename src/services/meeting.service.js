const Meeting = require("../models/meeting.model");
const throwError = require("../utils/throwError");

class MeetingService {
    async createMeeting(data, advisorUserId) {
        if (!advisorUserId) throwError("advisor_user_id is required", 422);

        const created = await Meeting.create({
            student_user_id: data.student_user_id,
            advisor_user_id: advisorUserId,
            term_code: data.term_code,
            meeting_time: data.meeting_time,
            notes_raw: data.notes_raw,
            notes_summary: data.notes_summary,
            summary_model: data.summary_model || "T5",
        });

        return created;
    }
}

module.exports = new MeetingService();
