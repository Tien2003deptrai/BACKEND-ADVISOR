const mongoose = require("mongoose");

const riskPredictionSchema = new mongoose.Schema(
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
        risk_score: { type: Number, required: true, min: 0, max: 1 },
        risk_label: { type: Number, enum: [-1, 0, 1], required: true },
        model_name: { type: String, default: "RandomForest" },
        predicted_at: { type: Date, required: true, default: Date.now },
        is_latest: { type: Boolean, default: true },
    },
    { timestamps: true, collection: "risk_predictions" }
);

riskPredictionSchema.index(
    { student_user_id: 1, term_id: 1, is_latest: 1 },
    { unique: true, partialFilterExpression: { is_latest: true } }
);
riskPredictionSchema.index({ risk_label: 1, predicted_at: -1 });

module.exports = mongoose.model("RiskPrediction", riskPredictionSchema);
