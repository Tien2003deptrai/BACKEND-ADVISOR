const userModel = require("../models/user.model");
const { signAccessToken } = require("../utils/jwt");
const throwError = require("../utils/throwError");
const { pick } = require("lodash");

class AuthService {
    async register(userData) {
        try {
            const createPayload = {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                name: userData.name,
                role: "STUDENT",
                status: "ACTIVE",
            };

            const createdUser = await userModel.create(createPayload);
            return pick(createdUser, ["_id", "username", "email", "role", "status"]);
        } catch (error) {
            if (error?.code === 11000) {
                throwError("Email or username already in use", 409);
            }

            throw error;
        }
    }

    async login(userData) {
        const user = await userModel
            .findOne({ email: userData.email })
            .select("+password +password_hash");
        if (!user) throwError("Invalid email or password", 401);

        const isMatch = await user.comparePassword(userData.password);
        if (!isMatch) throwError("Invalid email or password", 401);

        user.last_login_at = new Date();
        await user.save();

        const token = signAccessToken({ userId: user._id, role: user.role });

        const safeUser = pick(user, ["_id", "username", "email", "role", "status", "last_login_at"]);

        return { user: safeUser, token };
    }

    async logout() {
        return { logged_out: true };
    }
}

module.exports = new AuthService();
