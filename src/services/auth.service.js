const userModel = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const RevokedAccessToken = require("../models/revokedAccessToken.model");
const { randomUUID } = require("crypto");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const throwError = require("../utils/throwError");
const { pick } = require("lodash");

class AuthService {
    async login(userData) {
        const user = await userModel
            .findOne({ email: userData.email })
            .select("+password_hash");
        if (!user) throwError("Invalid email or password", 401);

        const isMatch = await user.comparePassword(userData.password);
        if (!isMatch) throwError("Invalid email or password", 401);
        if (user.status !== "ACTIVE") throwError("User is not active", 403);

        user.last_login_at = new Date();
        await user.save();

        const accessJti = randomUUID();
        const refreshJti = randomUUID();

        const accessToken = signAccessToken({ userId: user._id, role: user.role }, accessJti);
        const refreshToken = signRefreshToken({ userId: user._id, role: user.role }, refreshJti);

        const refreshPayload = verifyRefreshToken(refreshToken);
        await RefreshToken.create({
            user_id: user._id,
            jti: refreshPayload.jti,
            expires_at: new Date(refreshPayload.exp * 1000),
        });

        const safeUser = pick(user, ["_id", "username", "email", "role", "status", "last_login_at"]);

        return {
            user: safeUser,
            token_type: "Bearer",
            access_token: accessToken,
            refresh_token: refreshToken,
            access_expires_in: process.env.JWT_EXPIRES_IN || "15m",
            refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "1d",
        };
    }

    async refresh(rawRefreshToken) {
        let decoded;
        try {
            decoded = verifyRefreshToken(rawRefreshToken);
        } catch (error) {
            throwError("Invalid refresh token", 401);
        }

        if (decoded.token_type !== "refresh") throwError("Invalid refresh token type", 401);

        const storedToken = await RefreshToken.findOne({
            jti: decoded.jti,
            revoked_at: null,
            expires_at: { $gt: new Date() },
        }).select("_id user_id jti expires_at");

        if (!storedToken) throwError("Refresh token is expired or revoked", 401);

        const user = await userModel.findById(decoded.userId).select("_id role status username email last_login_at");
        if (!user) throwError("User not found", 401);
        if (user.status !== "ACTIVE") throwError("User is not active", 403);

        const now = new Date();
        await RefreshToken.updateOne({ _id: storedToken._id }, { $set: { revoked_at: now } });

        const accessJti = randomUUID();
        const refreshJti = randomUUID();
        const accessToken = signAccessToken({ userId: user._id, role: user.role }, accessJti);
        const refreshToken = signRefreshToken({ userId: user._id, role: user.role }, refreshJti);
        const newRefreshPayload = verifyRefreshToken(refreshToken);

        await RefreshToken.create({
            user_id: user._id,
            jti: newRefreshPayload.jti,
            expires_at: new Date(newRefreshPayload.exp * 1000),
        });

        const safeUser = pick(user, ["_id", "username", "email", "role", "status", "last_login_at"]);
        return {
            user: safeUser,
            token_type: "Bearer",
            access_token: accessToken,
            refresh_token: refreshToken,
            access_expires_in: process.env.JWT_EXPIRES_IN || "15m",
            refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "1d",
        };
    }

    async logout({ currentUser, accessTokenJti, accessTokenExp, refreshToken, allDevices }) {
        const now = new Date();

        if (accessTokenJti && accessTokenExp) {
            const expiresAt = new Date(accessTokenExp * 1000);
            if (expiresAt > now) {
                await RevokedAccessToken.updateOne(
                    { jti: accessTokenJti },
                    {
                        $setOnInsert: {
                            jti: accessTokenJti,
                            user_id: currentUser.userId,
                            expires_at: expiresAt,
                        },
                    },
                    { upsert: true }
                );
            }
        }

        if (allDevices) {
            await RefreshToken.updateMany(
                { user_id: currentUser.userId, revoked_at: null },
                { $set: { revoked_at: now } }
            );
            return { logged_out: true, all_devices: true };
        }

        if (refreshToken) {
            let decoded;
            try {
                decoded = verifyRefreshToken(refreshToken);
            } catch (error) {
                throwError("Invalid refresh token", 401);
            }

            if (decoded.token_type !== "refresh") throwError("Invalid refresh token type", 401);
            if (String(decoded.userId) !== String(currentUser.userId)) {
                throwError("Refresh token does not belong to current user", 403);
            }

            await RefreshToken.updateOne(
                { jti: decoded.jti, revoked_at: null },
                { $set: { revoked_at: now } }
            );
        }

        return { logged_out: true, all_devices: false };
    }
}

module.exports = new AuthService();
