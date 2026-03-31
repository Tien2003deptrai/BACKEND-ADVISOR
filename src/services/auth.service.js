const userModel = require("../models/user.model");
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

        const tokenPayload = {
            userId: user._id,
            role: user.role,
            tokenVersion: user.token_version || 0,
        };
        const accessToken = signAccessToken(tokenPayload, accessJti);
        const refreshToken = signRefreshToken(tokenPayload, refreshJti);

        const safeUser = pick(user, ["_id", "username", "email", "role", "status", "last_login_at"]);

        return {
            user: safeUser,
            token_type: "Bearer",
            access_token: accessToken,
            refresh_token: refreshToken,
            access_expires_in: process.env.JWT_EXPIRES_IN || "7d",
            refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "15d",
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

        const user = await userModel.findById(decoded.userId).select("_id role status username email last_login_at token_version");
        if (!user) throwError("User not found", 401);
        if (user.status !== "ACTIVE") throwError("User is not active", 403);
        if (Number(decoded.tokenVersion) !== Number(user.token_version || 0)) {
            throwError("Refresh token is expired or revoked", 401);
        }

        user.token_version = (user.token_version || 0) + 1;
        await user.save();

        const accessJti = randomUUID();
        const refreshJti = randomUUID();
        const tokenPayload = {
            userId: user._id,
            role: user.role,
            tokenVersion: user.token_version,
        };
        const accessToken = signAccessToken(tokenPayload, accessJti);
        const refreshToken = signRefreshToken(tokenPayload, refreshJti);

        const safeUser = pick(user, ["_id", "username", "email", "role", "status", "last_login_at"]);
        return {
            user: safeUser,
            token_type: "Bearer",
            access_token: accessToken,
            refresh_token: refreshToken,
            access_expires_in: process.env.JWT_EXPIRES_IN || "7d",
            refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "15d",
        };
    }

    async logout({ currentUser, refreshToken, allDevices }) {
        const user = await userModel.findById(currentUser.userId).select("_id token_version");
        if (!user) throwError("User not found", 401);

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
            if (Number(decoded.tokenVersion) !== Number(user.token_version || 0)) {
                throwError("Refresh token is expired or revoked", 401);
            }
        }

        user.token_version = (user.token_version || 0) + 1;
        await user.save();

        return { logged_out: true, all_devices: Boolean(allDevices) };
    }
}

module.exports = new AuthService();
