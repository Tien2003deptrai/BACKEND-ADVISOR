const AcademicRecord = require("../models/academicRecord.model");
const throwError = require("../utils/throwError");

class AcademicService {
    async submitAcademic(data, studentUserId) {

        if (!studentUserId) throwError("student_user_id is required", 422);
        if (!data.term_code) throwError("term_code is required", 422);

        const payload = {
            gpa_prev_sem: data.gpa_prev_sem,
            gpa_current: data.gpa_current,
            num_failed: data.num_failed,
            attendance_rate: data.attendance_rate,
            shcvht_participation: data.shcvht_participation,
            study_hours: data.study_hours,
            motivation_score: data.motivation_score,
            stress_score: data.stress_score,
            sentiment_score: data.sentiment_score,
            recorded_at: data.recorded_at || new Date(),
        };

        const updated = await AcademicRecord.findOneAndUpdate(
            { student_user_id: studentUserId, term_code: data.term_code },
            { $set: payload, $setOnInsert: { student_user_id: studentUserId, term_code: data.term_code } },
            { new: true, upsert: true }
        );

        return updated;
    }
}

module.exports = new AcademicService();
