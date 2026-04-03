const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        alert_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Alert",
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
        is_read: { type: Boolean, default: false },
        sent_at: { type: Date, default: Date.now },
        read_at: { type: Date },
    },
    { timestamps: true, collection: "notifications" }
);

notificationSchema.index({ recipient_user_id: 1, is_read: 1, sent_at: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
