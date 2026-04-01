const User = require("../models/user.model");
const Major = require("../models/major.model");
const throwError = require("../utils/throwError");
const { pick } = require("lodash");

class UserService {
    async createUser(body) {
        const hasDepartmentId = !!body.org?.department_id;
        const hasMajorId = !!body.org?.major_id;
        if (hasDepartmentId !== hasMajorId) {
            throwError("org.department_id and org.major_id must be provided together", 422);
        }

        let orgPayload;
        if (hasDepartmentId && hasMajorId) {
            const major = await Major.findById(body.org.major_id).select("_id department_id");
            if (!major) throwError("major not found", 404);

            if (String(major.department_id) !== String(body.org.department_id)) {
                throwError("major does not belong to department", 422);
            }

            orgPayload = {
                department_id: body.org.department_id,
                major_id: body.org.major_id,
            };
        }

        const payload = {
            username: body.username,
            email: body.email,
            password_hash: body.password,
            profile: {
                full_name: body.profile?.full_name,
            },
            org: orgPayload,
            role: body.role,
            status: "ACTIVE",
        };

        if (body.role === "STUDENT") {
            payload.student_info = {
                student_code: body.student_info?.student_code,
            };
        }

        if (body.role === "ADVISOR") {
            payload.advisor_info = {
                staff_code: body.advisor_info?.staff_code,
                title: body.advisor_info?.title,
            };
        }

        try {
            const createdUser = await User.create(payload);
            return pick(createdUser, ["_id", "username", "email", "role", "status", "profile", "org", "student_info", "advisor_info"]);
        } catch (error) {
            if (error?.code === 11000) {
                throwError("Email or username or student_code already in use", 409);
            }
            throw error;
        }
    }

    async getUserInfo(userId) {
        const user = await User.findById(userId).select(
            "_id username email role status profile org student_info advisor_info last_login_at createdAt updatedAt"
        );
        if (!user) throwError("User not found", 404);
        return user;
    }

    async getUsers(body) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = {};
        if (body.role) filter.role = body.role;
        if (body.status) filter.status = body.status;
        if (body.search) {
            filter.$or = [
                { username: { $regex: body.search, $options: "i" } },
                { email: { $regex: body.search, $options: "i" } },
                { "profile.full_name": { $regex: body.search, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            User.find(filter)
                .select("_id username email role status profile org student_info advisor_info createdAt updatedAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit) || 1,
            },
        };
    }
}

module.exports = new UserService();
