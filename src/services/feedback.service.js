const Feedback = require("../models/feedback.model");
const Meeting = require("../models/meeting.model");
const ClassMember = require("../models/classMember.model");
const throwError = require("../utils/throwError");

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_BASE_URL || "http://127.0.0.1:8001/api/v1";
const AI_SERVICE_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 10000);

class FeedbackService {
    async classifySentimentViaAI({ meetingId, studentUserId, feedbackText }) {
        const endpoint = `${AI_SERVICE_BASE_URL}/sentiment/classify`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT_MS);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meeting_id: String(meetingId),
                    student_user_id: String(studentUserId),
                    feedback_text: feedbackText,
                }),
                signal: controller.signal,
            });

            let payload = null;
            try {
                payload = await response.json();
            } catch {
                payload = null;
            }

            if (!response.ok) {
                const detail = payload?.detail || `AI service returned HTTP ${response.status}`;
                throwError(`sentiment classify failed: ${detail}`, 503);
            }

            const sentimentLabel = payload?.sentiment_label;
            const sentimentScore = payload?.sentiment_score;

            if (!["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(sentimentLabel)) {
                throwError("sentiment classify failed: invalid sentiment_label from AI service", 503);
            }
            if (typeof sentimentScore !== "number" || Number.isNaN(sentimentScore)) {
                throwError("sentiment classify failed: invalid sentiment_score from AI service", 503);
            }

            return { sentimentLabel, sentimentScore };
        } catch (error) {
            if (error?.name === "AbortError") {
                throwError("sentiment classify timeout from AI service", 504);
            }
            throw error;
        } finally {
            clearTimeout(timer);
        }
    }

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

        const { sentimentLabel, sentimentScore } = await this.classifySentimentViaAI({
            meetingId: meeting._id,
            studentUserId,
            feedbackText: data.feedback_text,
        });

        let created;
        try {
            created = await Feedback.create({
                class_id: meeting.class_id,
                student_user_id: studentUserId,
                advisor_user_id: meeting.advisor_user_id,
                meeting_id: meeting._id,
                feedback_text: data.feedback_text,
                rating: data.rating,
                sentiment_label: sentimentLabel,
                feedback_score: sentimentScore,
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
