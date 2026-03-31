const User = require("../models/user.model");
const ClassMember = require("../models/classMember.model");
const AdvisorClass = require("../models/advisorClass.model");
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

    async getMyAdvisor(studentUserId) {
        if (!studentUserId) throwError("student_user_id is required", 422);

        const student = await User.findOne({ _id: studentUserId, role: "STUDENT" }).select(
            "_id org student_info"
        );
        if (!student) throwError("Student not found", 404);

        let advisorClass = null;
        let advisorUserId = student.student_info?.advisor_user_id ? String(student.student_info.advisor_user_id) : "";

        const activeMembership = await ClassMember.findOne({
            student_user_id: studentUserId,
            status: "ACTIVE",
        }).select("class_id joined_at");

        if (activeMembership?.class_id) {
            advisorClass = await AdvisorClass.findById(activeMembership.class_id).select(
                "_id class_code class_name advisor_user_id department_id major_id cohort_year status"
            );
            if (advisorClass?.advisor_user_id && !advisorUserId) {
                advisorUserId = String(advisorClass.advisor_user_id);
            }
        }

        let advisor = null;
        if (advisorUserId) {
            advisor = await User.findOne({ _id: advisorUserId, role: "ADVISOR" }).select(
                "_id username email status profile advisor_info org"
            );
        }

        return {
            student_user_id: student._id,
            advisor: advisor
                ? {
                      _id: advisor._id,
                      username: advisor.username,
                      email: advisor.email,
                      status: advisor.status,
                      profile: advisor.profile,
                      advisor_info: advisor.advisor_info,
                      org: advisor.org,
                  }
                : null,
            advisor_class: advisorClass
                ? {
                      _id: advisorClass._id,
                      class_code: advisorClass.class_code,
                      class_name: advisorClass.class_name,
                      advisor_user_id: advisorClass.advisor_user_id,
                      department_id: advisorClass.department_id,
                      major_id: advisorClass.major_id,
                      cohort_year: advisorClass.cohort_year,
                      status: advisorClass.status,
                  }
                : null,
        };
    }
}

module.exports = new StudentService();
