const AdvisorClass = require("../models/advisorClass.model");
const User = require("../models/user.model");
const Major = require("../models/major.model");
const throwError = require("../utils/throwError");

class AdvisorClassService {
    async upsertClass(data, currentUser) {
        const advisorUserId = data.advisor_user_id;
        if (!advisorUserId) throwError("advisor_user_id is required", 422);

        const advisor = await User.findOne({ _id: advisorUserId, role: "ADVISOR" }).select("_id org.department_id");
        if (!advisor) throwError("advisor_user_id must be a valid ADVISOR user", 422);
        if (!advisor.org?.department_id) throwError("advisor does not have department_id", 422);
        if (String(advisor.org.department_id) !== String(data.department_id)) {
            throwError("advisor must belong to class department", 422);
        }

        let orgPayload = {};
        if (data.major_id) {
            const major = await Major.findById(data.major_id).select("_id department_id");
            if (!major) throwError("major not found", 404);
            if (String(major.department_id) !== String(data.department_id)) {
                throwError("major does not belong to department", 422);
            }

            orgPayload = {
                department_id: data.department_id,
                major_id: data.major_id,
            };
        } else {
            orgPayload = {
                department_id: data.department_id,
                major_id: undefined,
            };
        }

        const payload = {
            class_code: data.class_code,
            class_name: data.class_name,
            advisor_user_id: advisorUserId,
            ...orgPayload,
            cohort_year: data.cohort_year,
            status: data.status || "ACTIVE",
        };

        const result = await AdvisorClass.findOneAndUpdate(
            { advisor_user_id: advisorUserId },
            { $set: payload },
            { new: true, upsert: true }
        );

        return result;
    }

    async getMyClass(currentUser, body) {
        const advisorUserId = currentUser.role === "ADVISOR" ? currentUser.userId : body.advisor_user_id;
        if (!advisorUserId) throwError("advisor_user_id is required", 422);

        const item = await AdvisorClass.findOne({ advisor_user_id: advisorUserId });
        if (!item) throwError("advisor class not found", 404);
        return item;
    }
}

module.exports = new AdvisorClassService();
