const AdvisorClass = require("../models/advisorClass.model");
const throwError = require("../utils/throwError");

class AdvisorClassService {
    async upsertClass(data, currentUser) {
        const advisorUserId = currentUser.role === "ADVISOR" ? currentUser.userId : data.advisor_user_id;
        if (!advisorUserId) throwError("advisor_user_id is required", 422);

        const payload = {
            class_code: data.class_code,
            class_name: data.class_name,
            advisor_user_id: advisorUserId,
            faculty_code: data.faculty_code,
            program_code: data.program_code,
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

