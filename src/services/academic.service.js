const AcademicRecord = require("../models/academicRecord.model");
const Term = require("../models/term.model");
const Feedback = require("../models/feedback.model");
const mongoose = require("mongoose");
const throwError = require("../utils/throwError");

class AcademicService {
    async submitAcademic(data, studentUserId) {

        if (!studentUserId) throwError("student_user_id is required", 422);
        if (!data.term_id) throwError("term_id is required", 422);
        const term = await Term.findById(data.term_id).select("_id");
        if (!term) throwError("term_id is invalid", 422);

        const sentimentAgg = await Feedback.aggregate([
            {
                $match: {
                    student_user_id: new mongoose.Types.ObjectId(studentUserId),
                    feedback_score: { $type: "number" },
                },
            },
            {
                $lookup: {
                    from: "meetings",
                    localField: "meeting_id",
                    foreignField: "_id",
                    as: "meeting",
                },
            },
            { $unwind: "$meeting" },
            {
                $match: {
                    "meeting.term_id": new mongoose.Types.ObjectId(data.term_id),
                },
            },
            {
                $group: {
                    _id: null,
                    avg_feedback_score: { $avg: "$feedback_score" },
                },
            },
        ]);
        const computedSentimentScore = sentimentAgg.length ? sentimentAgg[0].avg_feedback_score : null;

        const payload = {
            gpa_prev_sem: data.gpa_prev_sem,
            gpa_current: data.gpa_current,
            num_failed: data.num_failed,
            attendance_rate: data.attendance_rate,
            shcvht_participation: data.shcvht_participation,
            study_hours: data.study_hours,
            motivation_score: data.motivation_score,
            stress_level: data.stress_level,
            sentiment_score: computedSentimentScore,
            recorded_at: data.recorded_at || new Date(),
        };

        const updated = await AcademicRecord.findOneAndUpdate(
            { student_user_id: studentUserId, term_id: data.term_id },
            { $set: payload, $setOnInsert: { student_user_id: studentUserId, term_id: data.term_id } },
            { new: true, upsert: true }
        );

        return updated;
    }
}

module.exports = new AcademicService();
