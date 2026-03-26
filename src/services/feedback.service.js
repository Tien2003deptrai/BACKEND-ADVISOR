const Feedback = require("../models/feedback.model");
const Meeting = require("../models/meeting.model");
const ClassMember = require("../models/classMember.model");
const throwError = require("../utils/throwError");

class FeedbackService {
    async submitFeedback(data, studentUserId) {
        if (!studentUserId) throwError("student_user_id is required", 422);

        const meeting = await Meeting.findById(data.meeting_id).select("_id class_id advisor_user_id student_user_ids meeting_end_time");
        if (!meeting) throwError("meeting not found", 404);

        const isInvitedStudent = meeting.student_user_ids?.some(
            (id) => String(id) === String(studentUserId)
        );
        if (!isInvitedStudent) {
            throwError("student is not in this meeting", 403);
        }

        const membership = await ClassMember.findOne({
            class_id: meeting.class_id,
            student_user_id: studentUserId,
            status: "ACTIVE",
        }).select("_id");

        if (!membership) {
            throwError("student is not an active member of meeting class", 403);
        }

        const submittedAt = data.submitted_at ? new Date(data.submitted_at) : new Date();
        const meetingEndTime = new Date(meeting.meeting_end_time);
        const maxAllowedTime = new Date(meetingEndTime.getTime() + 24 * 60 * 60 * 1000);

        if (submittedAt < meetingEndTime) {
            throwError("feedback can only be submitted after meeting ends", 422);
        }
        if (submittedAt > maxAllowedTime) {
            throwError("feedback must be submitted within 24 hours after meeting ends", 422);
        }

        let created;
        try {
            created = await Feedback.create({
                class_id: meeting.class_id,
                student_user_id: studentUserId,
                advisor_user_id: meeting.advisor_user_id,
                meeting_id: meeting._id,
                feedback_text: data.feedback_text,
                rating: data.rating,
                sentiment_label: data.sentiment_label,
                submitted_at: submittedAt,
            });
        } catch (error) {
            if (error?.code === 11000) {
                throwError("feedback already submitted for this meeting", 409);
            }
            throw error;
        }

        return created;
    }

    async getFeedbackList(body) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = {};
        if (body.class_id) filter.class_id = body.class_id;
        if (body.student_user_id) filter.student_user_id = body.student_user_id;
        if (body.advisor_user_id) filter.advisor_user_id = body.advisor_user_id;

        if (body.sentiment_label) filter.sentiment_label = body.sentiment_label;

        const [items, total] = await Promise.all([
            Feedback.find(filter).sort({ submitted_at: -1 }).skip(skip).limit(limit),
            Feedback.countDocuments(filter),
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
}

module.exports = new FeedbackService();
