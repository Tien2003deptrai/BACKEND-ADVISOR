const mongoose = require("mongoose");

const anomalyAlertSchema = new mongoose.Schema(
    {
        student_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        term_code: { type: String, required: true, trim: true },
        alert_type: { type: String, required: true, trim: true },
        severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
        message: { type: String, trim: true },
        model_name: { type: String, default: "IsolationForest" },
        detected_at: { type: Date, required: true, default: Date.now },
        status: { type: String, enum: ["OPEN", "ACKED", "RESOLVED"], default: "OPEN" },
    },
    { timestamps: true, collection: "anomaly_alerts" }
);

anomalyAlertSchema.index({ student_user_id: 1, detected_at: -1 });
anomalyAlertSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model("AnomalyAlert", anomalyAlertSchema);

