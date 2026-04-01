const Meeting = require("../models/meeting.model");
const Feedback = require("../models/feedback.model");
const AdvisorClass = require("../models/advisorClass.model");
const ClassMember = require("../models/classMember.model");
const Term = require("../models/term.model");
const throwError = require("../utils/throwError");

class MeetingService {
    async listMyMeetings(body, studentUserId) {
        if (!studentUserId) throwError("student_user_id is required", 422);

        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = { student_user_ids: studentUserId };
        const [items, total] = await Promise.all([
            Meeting.find(filter)
                .sort({ meeting_time: -1 })
                .skip(skip)
                .limit(limit)
                .populate("class_id", "class_code class_name")
                .populate("advisor_user_id", "profile.full_name advisor_info.staff_code advisor_info.title email")
                .select(
                    "_id class_id advisor_user_id term_id meeting_time meeting_end_time notes_summary summary_model createdAt"
                ),
            Meeting.countDocuments(filter),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async getInfoMeeting(body, studentUserId) {
        if (!studentUserId) throwError("student_user_id is required", 422);

        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = { student_user_ids: studentUserId };
        const [meetings, total] = await Promise.all([
            Meeting.find(filter)
                .sort({ meeting_time: -1 })
                .skip(skip)
                .limit(limit)
                .populate("class_id", "class_code class_name")
                .populate("advisor_user_id", "profile.full_name advisor_info.staff_code advisor_info.title email")
                .select("_id class_id advisor_user_id meeting_time meeting_end_time"),
            Meeting.countDocuments(filter),
        ]);

        const meetingIds = meetings.map((item) => item._id);
        const stats = await Feedback.aggregate([
            {
                $match: {
                    student_user_id: studentUserId,
                    meeting_id: { $in: meetingIds },
                },
            },
            {
                $group: {
                    _id: "$meeting_id",
                    feedback_count: { $sum: 1 },
                    latest_submitted_at: { $max: "$submitted_at" },
                },
            },
        ]);

        const statMap = new Map(
            stats.map((item) => [String(item._id), item])
        );

        const items = meetings.map((meeting) => {
            const classObj = meeting.class_id;
            const advisorObj = meeting.advisor_user_id;
            const classId = classObj?._id ? String(classObj._id) : String(meeting.class_id || "");
            const advisorId = advisorObj?._id
                ? String(advisorObj._id)
                : String(meeting.advisor_user_id || "");
            const classCode = classObj?.class_code || "";
            const className = classObj?.class_name || "";
            const advisorName = advisorObj?.profile?.full_name || "";
            const advisorEmail = advisorObj?.email || "";
            const advisorStaffCode = advisorObj?.advisor_info?.staff_code || "";
            const stat = statMap.get(String(meeting._id));

            return {
                meeting_id: String(meeting._id),
                class_id: classId,
                advisor_user_id: advisorId,
                class_label: [classCode, className].filter(Boolean).join(" — ") || classId || "—",
                advisor_label:
                    [advisorName, advisorStaffCode ? `(${advisorStaffCode})` : "", advisorEmail]
                        .filter(Boolean)
                        .join(" • ") ||
                    advisorId ||
                    "—",
                meeting_time: meeting.meeting_time,
                meeting_end_time: meeting.meeting_end_time,
                feedback_count: stat?.feedback_count || 0,
                latest_submitted_at: stat?.latest_submitted_at || null,
            };
        });

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit) || 1,
            },
        };
    }

    async listAdvisorMeetings(body, advisorUserId) {
        if (!advisorUserId) throwError("advisor_user_id is required", 422);

        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = { advisor_user_id: advisorUserId };
        const [items, total] = await Promise.all([
            Meeting.find(filter)
                .sort({ meeting_time: -1 })
                .skip(skip)
                .limit(limit)
                .populate("class_id", "class_code class_name")
                .populate("student_user_ids", "username email profile.full_name student_info.student_code")
                .select(
                    "_id class_id advisor_user_id term_id student_user_ids meeting_time meeting_end_time notes_summary createdAt"
                ),
            Meeting.countDocuments(filter),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit) || 1,
            },
        };
    }

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
