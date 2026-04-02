const AcademicRecord = require("../models/academicRecord.model");
const RiskPrediction = require("../models/riskPrediction.model");
const Recommendation = require("../models/recommendation.model");
const Term = require("../models/term.model");
const Feedback = require("../models/feedback.model");
const mongoose = require("mongoose");
const throwError = require("../utils/throwError");

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_BASE_URL || "http://127.0.0.1:8001/api/v1";
const AI_SERVICE_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 10000);
const MAX_RECOMMENDATIONS_PER_PREDICTION = 3;

const RECOMMENDATION_GROUPS = {
    ACADEMIC: "ACADEMIC",
    WELLBEING: "WELLBEING",
    ATTENDANCE: "ATTENDANCE",
};

const RECOMMENDATION_TEMPLATES = {
    "-1": {
        priority: "HIGH",
        items: {
            [RECOMMENDATION_GROUPS.ACADEMIC]: {
                title: "Cần cải thiện kết quả học tập khẩn cấp",
                content:
                    "GPA hiện tại thấp hoặc đã có môn rớt. Sinh viên cần lập kế hoạch học lại, tăng thời gian tự học và trao đổi sớm với cố vấn học tập.",
            },
            [RECOMMENDATION_GROUPS.WELLBEING]: {
                title: "Dấu hiệu căng thẳng và tâm lý tiêu cực",
                content:
                    "Mức căng thẳng cao hoặc phản hồi cảm xúc tiêu cực. Cố vấn học tập nên chủ động liên hệ để tư vấn và hỗ trợ tinh thần.",
            },
            [RECOMMENDATION_GROUPS.ATTENDANCE]: {
                title: "Tỉ lệ tham gia lớp học thấp",
                content:
                    "Sinh viên vắng học nhiều buổi. Cần cải thiện chuyên cần và theo dõi sát sao lịch học.",
            },
        },
    },
    "0": {
        priority: "MEDIUM",
        items: {
            [RECOMMENDATION_GROUPS.ACADEMIC]: {
                title: "Nên cải thiện hiệu quả học tập",
                content:
                    "Kết quả học tập chưa ổn định. Nên điều chỉnh phương pháp học và phân bổ thời gian hợp lý hơn.",
            },
            [RECOMMENDATION_GROUPS.WELLBEING]: {
                title: "Cần cân bằng tâm lý học tập",
                content:
                    "Có dấu hiệu áp lực hoặc cảm xúc chưa tích cực. Nên nghỉ ngơi hợp lý và trao đổi khi cần.",
            },
            [RECOMMENDATION_GROUPS.ATTENDANCE]: {
                title: "Nên duy trì tham gia lớp đầy đủ hơn",
                content:
                    "Tỉ lệ tham gia lớp chưa cao. Cần hạn chế vắng học để theo kịp bài giảng.",
            },
        },
    },
    "1": {
        priority: "LOW",
        items: {
            [RECOMMENDATION_GROUPS.ACADEMIC]: {
                title: "Duy trì kết quả học tập tốt",
                content:
                    "Sinh viên đang có kết quả học tập tốt. Nên tiếp tục duy trì phương pháp học hiện tại.",
            },
            [RECOMMENDATION_GROUPS.WELLBEING]: {
                title: "Tâm lý học tập ổn định",
                content:
                    "Tinh thần học tập tích cực. Nên giữ thói quen sinh hoạt và nghỉ ngơi hợp lý.",
            },
            [RECOMMENDATION_GROUPS.ATTENDANCE]: {
                title: "Duy trì chuyên cần lớp học",
                content:
                    "Sinh viên tham gia lớp học đầy đủ. Cần tiếp tục phát huy.",
            },
        },
    },
};

class AcademicService {
    resolveGroupRiskLevels(payload) {
        const academicHigh = payload.gpa_current < 2.5 || payload.num_failed >= 2;
        const academicLow = payload.gpa_current >= 2.8 && payload.num_failed === 0;
        const wellbeingHigh = payload.stress_level >= 3 || payload.sentiment_score < -0.2;
        const wellbeingLow = payload.stress_level <= 2 && payload.sentiment_score >= 0.2;
        const attendanceHigh = payload.attendance_rate < 0.7;
        const attendanceLow = payload.attendance_rate >= 0.8;

        return {
            [RECOMMENDATION_GROUPS.ACADEMIC]: academicHigh ? -1 : academicLow ? 1 : 0,
            [RECOMMENDATION_GROUPS.WELLBEING]: wellbeingHigh ? -1 : wellbeingLow ? 1 : 0,
            [RECOMMENDATION_GROUPS.ATTENDANCE]: attendanceHigh ? -1 : attendanceLow ? 1 : 0,
        };
    }

    pickRecommendationGroups({ riskLabel, groupLevels }) {
        const allGroups = [
            RECOMMENDATION_GROUPS.ACADEMIC,
            RECOMMENDATION_GROUPS.WELLBEING,
            RECOMMENDATION_GROUPS.ATTENDANCE,
        ];

        const sameRiskGroups = allGroups.filter((group) => groupLevels[group] === riskLabel);
        if (sameRiskGroups.length) {
            return sameRiskGroups.slice(0, MAX_RECOMMENDATIONS_PER_PREDICTION);
        }

        // Fallback to avoid empty recommendations when group levels are mixed.
        return allGroups.slice(0, MAX_RECOMMENDATIONS_PER_PREDICTION);
    }

    async replaceRecommendationsForRisk({ studentUserId, termId, riskPredictionId, riskLabel, payload }) {
        const template = RECOMMENDATION_TEMPLATES[String(riskLabel)] || RECOMMENDATION_TEMPLATES["0"];
        const groupLevels = this.resolveGroupRiskLevels(payload);
        const selectedGroups = this.pickRecommendationGroups({ riskLabel, groupLevels });

        if (!selectedGroups.length) return [];

        const docs = selectedGroups.map((group) => ({
            student_user_id: studentUserId,
            term_id: termId,
            risk_prediction_id: riskPredictionId,
            title: template.items[group].title,
            content: template.items[group].content,
            priority: template.priority,
        }));

        return Recommendation.insertMany(docs);
    }

    async predictRiskViaAI({ studentUserId, termId, payload }) {
        const endpoint = `${AI_SERVICE_BASE_URL}/risk/predict`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT_MS);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_user_id: String(studentUserId),
                    term_id: String(termId),
                    ...payload,
                }),
                signal: controller.signal,
            });

            let data = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                const detail = data?.detail || `AI service returned HTTP ${response.status}`;
                throwError(`risk predict failed: ${detail}`, 503);
            }

            const riskScore = data?.risk_score;
            const riskLabel = data?.risk_label;
            const modelName = data?.meta?.model_name;

            if (typeof riskScore !== "number" || Number.isNaN(riskScore)) {
                throwError("risk predict failed: invalid risk_score from AI service", 503);
            }
            if (![-1, 0, 1].includes(riskLabel)) {
                throwError("risk predict failed: invalid risk_label from AI service", 503);
            }

            return {
                riskScore,
                riskLabel,
                modelName: typeof modelName === "string" && modelName.trim() ? modelName.trim() : "RandomForest",
            };
        } catch (error) {
            if (error?.name === "AbortError") {
                throwError("risk predict timeout from AI service", 504);
            }
            throw error;
        } finally {
            clearTimeout(timer);
        }
    }

    async upsertRiskPrediction({ studentUserId, termId, riskScore, riskLabel, modelName }) {
        const now = new Date();
        await RiskPrediction.updateMany(
            { student_user_id: studentUserId, term_id: termId, is_latest: true },
            { $set: { is_latest: false } }
        );

        return RiskPrediction.create({
            student_user_id: studentUserId,
            term_id: termId,
            risk_score: riskScore,
            risk_label: riskLabel,
            model_name: modelName || "RandomForest",
            predicted_at: now,
            is_latest: true,
        });
    }

    async submitAcademic(data, studentUserId) {

        if (!studentUserId) throwError("student_user_id is required", 422);
        if (!data.term_id) throwError("term_id is required", 422);
        const term = await Term.findById(data.term_id).select("_id");
        if (!term) throwError("term_id is invalid", 422);

        const sentimentAgg = await Feedback.aggregate([
            {
                $match: {
                    student_user_id: new mongoose.Types.ObjectId(studentUserId),
                    feedback_score: { $type: "number" },
                },
            },
            {
                $lookup: {
                    from: "meetings",
                    localField: "meeting_id",
                    foreignField: "_id",
                    as: "meeting",
                },
            },
            { $unwind: "$meeting" },
            {
                $match: {
                    "meeting.term_id": new mongoose.Types.ObjectId(data.term_id),
                },
            },
            {
                $group: {
                    _id: null,
                    avg_feedback_score: { $avg: "$feedback_score" },
                },
            },
        ]);
        const computedSentimentScore = sentimentAgg.length ? sentimentAgg[0].avg_feedback_score : null;

        const payload = {
            gpa_prev_sem: data.gpa_prev_sem,
            gpa_current: data.gpa_current,
            num_failed: data.num_failed,
            attendance_rate: data.attendance_rate,
            shcvht_participation: data.shcvht_participation,
            study_hours: data.study_hours,
            motivation_score: data.motivation_score,
            stress_level: data.stress_level,
            sentiment_score: computedSentimentScore,
            recorded_at: data.recorded_at || new Date(),
        };

        const updated = await AcademicRecord.findOneAndUpdate(
            { student_user_id: studentUserId, term_id: data.term_id },
            { $set: payload, $setOnInsert: { student_user_id: studentUserId, term_id: data.term_id } },
            { new: true, upsert: true }
        );

        const riskPayload = {
            gpa_current: Number(updated.gpa_current),
            attendance_rate: Number(updated.attendance_rate),
            num_failed: Number(updated.num_failed),
            stress_level: Number(updated.stress_level),
            motivation_score: Number(updated.motivation_score),
            shcvht_participation: Number(updated.shcvht_participation),
            study_hours: Number(updated.study_hours),
            // Keep neutral fallback when there is no sentiment from AI-02/feedback yet.
            sentiment_score:
                typeof updated.sentiment_score === "number" && !Number.isNaN(updated.sentiment_score)
                    ? Number(updated.sentiment_score)
                    : 0,
        };

        const missingRiskFields = Object.entries(riskPayload)
            .filter(([, value]) => Number.isNaN(value))
            .map(([key]) => key);

        if (missingRiskFields.length) {
            throwError(`missing required fields for risk prediction: ${missingRiskFields.join(", ")}`, 422);
        }

        try {
            const risk = await this.predictRiskViaAI({
                studentUserId,
                termId: data.term_id,
                payload: riskPayload,
            });
            const riskPrediction = await this.upsertRiskPrediction({
                studentUserId,
                termId: data.term_id,
                riskScore: risk.riskScore,
                riskLabel: risk.riskLabel,
                modelName: risk.modelName,
            });
            await this.replaceRecommendationsForRisk({
                studentUserId,
                termId: data.term_id,
                riskPredictionId: riskPrediction?._id,
                riskLabel: risk.riskLabel,
                payload: riskPayload,
            });
        } catch (error) {
            // Do not block academic submit if AI service is temporarily unavailable.
            console.warn("AI risk unavailable, skip saving risk prediction:", error?.message || error);
        }

        return updated;
    }
}

module.exports = new AcademicService();
