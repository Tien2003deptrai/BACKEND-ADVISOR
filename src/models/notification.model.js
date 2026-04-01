const mongoose = require("mongoose");

const refSchema = new mongoose.Schema(
    {
        collection_name: { type: String, required: true, alias: "collection" },
        doc_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    },
    { _id: false }
);

const notificationSchema = new mongoose.Schema(
    {
        recipient_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["RISK_ALERT", "SENTIMENT_ALERT", "ANOMALY_ALERT", "SYSTEM"],
            required: true,
        },
        title: { type: String, trim: true },
        content: { type: String, trim: true },
        term_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Term",
            index: true,
        },
        ref: { type: refSchema, default: undefined },
        is_read: { type: Boolean, default: false },
        sent_at: { type: Date, required: true, default: Date.now },
        read_at: { type: Date },
    },
    { timestamps: true, collection: "notifications" }
);

notificationSchema.index({ recipient_user_id: 1, is_read: 1, sent_at: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
