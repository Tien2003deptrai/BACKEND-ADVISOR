const AdvisorClass = require("../models/advisorClass.model");
const ClassMember = require("../models/classMember.model");
const User = require("../models/user.model");
const throwError = require("../utils/throwError");

class ClassMemberService {
    async addMembers(data, currentUser) {
        const classItem = await AdvisorClass.findById(data.class_id).select("_id advisor_user_id status");
        if (!classItem) throwError("class not found", 404);
        if (classItem.status !== "ACTIVE") throwError("class is not active", 422);
        if (currentUser.role === "ADVISOR" && String(classItem.advisor_user_id) !== String(currentUser.userId)) {
            throwError("forbidden for this class", 403);
        }

        const studentIds = Array.from(new Set((data.student_user_ids || []).map(String)));
        if (!studentIds.length) throwError("student_user_ids is required", 422);

        const students = await User.find({ _id: { $in: studentIds }, role: "STUDENT" }).select("_id");
        if (students.length !== studentIds.length) {
            throwError("all student_user_ids must be valid STUDENT users", 422);
        }

        const existingRows = await ClassMember.find({ student_user_id: { $in: studentIds } }).select(
            "_id class_id student_user_id"
        );
        const existingByStudent = new Map(existingRows.map((item) => [String(item.student_user_id), item]));
        const classId = String(classItem._id);

        for (const studentId of studentIds) {
            const existing = existingByStudent.get(studentId);
            if (existing && String(existing.class_id) !== classId) {
                throwError(`student ${studentId} already belongs to another class`, 409);
            }
        }

        for (const studentId of studentIds) {
            await ClassMember.updateOne(
                { student_user_id: studentId },
                {
                    $set: {
                        class_id: classItem._id,
                        student_user_id: studentId,
                        status: "ACTIVE",
                    },
                    $setOnInsert: { joined_at: new Date() },
                },
                { upsert: true }
            );
        }

        return {
            class_id: classItem._id,
            added_count: studentIds.length,
        };
    }

    async listMembers(body, currentUser) {
        let classId = body.class_id;
        if (currentUser.role === "ADVISOR") {
            const advisorClass = await AdvisorClass.findOne({ advisor_user_id: currentUser.userId }).select("_id");
            if (!advisorClass) throwError("advisor class not found", 404);
            classId = advisorClass._id;
        }
        if (!classId) throwError("class_id is required", 422);

        const page = Number(body.page || 1);
        const limit = Number(body.limit || 50);
        const skip = (page - 1) * limit;

        const filter = { class_id: classId };
        if (body.status) filter.status = body.status;

        const [rows, total] = await Promise.all([
            ClassMember.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ClassMember.countDocuments(filter),
        ]);

        const studentIds = rows.map((item) => item.student_user_id);
        const students = await User.find({ _id: { $in: studentIds } }).select(
            "_id username email profile.full_name student_info status"
        );
        const studentMap = new Map(students.map((item) => [String(item._id), item]));

        const items = rows.map((row) => ({
            _id: row._id,
            class_id: row.class_id,
            student_user_id: row.student_user_id,
            joined_at: row.joined_at,
            status: row.status,
            student: studentMap.get(String(row.student_user_id)) || null,
        }));

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

module.exports = new ClassMemberService();

