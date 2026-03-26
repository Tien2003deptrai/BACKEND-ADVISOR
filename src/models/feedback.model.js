const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdvisorClass",
            required: true,
            index: true,
        },
        student_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        advisor_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        meeting_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting",
            required: true,
            index: true,
        },
        feedback_text: { type: String, required: true, trim: true },
        rating: { type: Number, min: 1, max: 5 },
        submitted_at: { type: Date, required: true, default: Date.now },
        sentiment_label: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
    },
    { timestamps: true, collection: "feedbacks" }
);

feedbackSchema.index({ class_id: 1, submitted_at: -1 });
feedbackSchema.index({ student_user_id: 1, submitted_at: -1 });
feedbackSchema.index({ advisor_user_id: 1, submitted_at: -1 });
feedbackSchema.index({ sentiment_label: 1 });
feedbackSchema.index({ meeting_id: 1, student_user_id: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
