const mongoose = require("mongoose");

const revokedAccessTokenSchema = new mongoose.Schema(
    {
        jti: { type: String, required: true, unique: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        expires_at: { type: Date, required: true },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "revoked_access_tokens" }
);

revokedAccessTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RevokedAccessToken", revokedAccessTokenSchema);
