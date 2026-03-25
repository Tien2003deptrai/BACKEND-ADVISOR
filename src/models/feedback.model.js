const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
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
        meeting_id: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", index: true },
        feedback_text: { type: String, required: true, trim: true },
        rating: { type: Number, min: 1, max: 5 },
        submitted_at: { type: Date, required: true, default: Date.now },
        label: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
    },
    { timestamps: true, collection: "feedbacks" }
);

feedbackSchema.index({ student_user_id: 1, submitted_at: -1 });
feedbackSchema.index({ advisor_user_id: 1, submitted_at: -1 });
feedbackSchema.index({ "sentiment.label": 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);

