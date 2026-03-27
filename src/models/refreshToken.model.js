const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        jti: { type: String, required: true, unique: true },
        expires_at: { type: Date, required: true },
        revoked_at: { type: Date, default: null, index: true },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "refresh_tokens" }
);

refreshTokenSchema.index({ user_id: 1, revoked_at: 1 });
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
