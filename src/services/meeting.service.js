const Meeting = require("../models/meeting.model");
const AdvisorClass = require("../models/advisorClass.model");
const ClassMember = require("../models/classMember.model");
const Term = require("../models/term.model");
const throwError = require("../utils/throwError");

class MeetingService {
    async createMeeting(data, advisorUserId) {
        if (!advisorUserId) throwError("advisor_user_id is required", 422);

        const advisorClass = await AdvisorClass.findOne({
            _id: data.class_id,
            advisor_user_id: advisorUserId,
            status: "ACTIVE",
        }).select("_id");
        if (!advisorClass) throwError("class_id is invalid for this advisor", 403);

        const studentIds = Array.from(new Set((data.student_user_ids || []).map(String)));
        if (!studentIds.length) throwError("student_user_ids is required", 422);

        const activeMembers = await ClassMember.find({
            class_id: data.class_id,
            student_user_id: { $in: studentIds },
            status: "ACTIVE",
        }).select("student_user_id");

        if (activeMembers.length !== studentIds.length) {
            throwError("all student_user_ids must be active members of class_id", 422);
        }
        if (data.term_id) {
            const term = await Term.findById(data.term_id).select("_id");
            if (!term) throwError("term_id is invalid", 422);
        }

        const created = await Meeting.create({
            class_id: data.class_id,
            student_user_ids: studentIds,
            advisor_user_id: advisorUserId,
            term_id: data.term_id,
            meeting_time: data.meeting_time,
            meeting_end_time: data.meeting_end_time,
            notes_raw: data.notes_raw,
            notes_summary: data.notes_summary,
            summary_model: data.summary_model || "T5",
        });

        return created;
    }
}

module.exports = new MeetingService();
