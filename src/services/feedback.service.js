const Feedback = require("../models/feedback.model");
const throwError = require("../utils/throwError");

class FeedbackService {
    async submitFeedback(data, studentUserId) {
        if (!studentUserId) throwError("student_user_id is required", 422);

        const created = await Feedback.create({
            student_user_id: studentUserId,
            advisor_user_id: data.advisor_user_id,
            meeting_id: data.meeting_id,
            feedback_text: data.feedback_text,
            rating: data.rating,
            sentiment_label: data.sentiment_label,
            submitted_at: data.submitted_at || new Date(),
        });

        return created;
    }

    async getFeedbackList(body) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = {};
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
