const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
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
        term_code: { type: String, trim: true },
        meeting_time: { type: Date, required: true },
        notes_raw: { type: String, required: true },
        notes_summary: { type: String },
        summary_model: { type: String, default: "T5" },
    },
    { timestamps: true, collection: "meetings" }
);

meetingSchema.index({ student_user_id: 1, meeting_time: -1 });
meetingSchema.index({ advisor_user_id: 1, meeting_time: -1 });

module.exports = mongoose.model("Meeting", meetingSchema);

