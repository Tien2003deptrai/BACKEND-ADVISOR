const User = require("../models/user.model");
const throwError = require("../utils/throwError");

class StudentService {
    async getStudents(body) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const filter = { role: "STUDENT" };
        if (body.search) {
            filter.$or = [
                { username: { $regex: body.search, $options: "i" } },
                { email: { $regex: body.search, $options: "i" } },
                { "student_info.student_code": { $regex: body.search, $options: "i" } },
                { "profile.full_name": { $regex: body.search, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            User.find(filter)
                .select("_id username email role status profile org student_info createdAt updatedAt")
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

    async getStudentById(id) {
        const filter = { _id: id, role: "STUDENT" };

        const student = await User.findOne(filter).select(
            "_id username email role status profile org student_info createdAt updatedAt"
        );
        if (!student) throwError("Student not found", 404);
        return student;
    }
}

module.exports = new StudentService();
