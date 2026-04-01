const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
    {
        student_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        term_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Term",
            required: true,
            index: true,
        },
        risk_prediction_id: { type: mongoose.Schema.Types.ObjectId, ref: "RiskPrediction" },
        title: { type: String, trim: true },
        content: { type: String, required: true, trim: true },
        priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    },
    { timestamps: true, collection: "recommendations" }
);

recommendationSchema.index({ student_user_id: 1, createdAt: -1 });

module.exports = mongoose.model("Recommendation", recommendationSchema);

