const User = require("../models/user.model");

class UserService {
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

