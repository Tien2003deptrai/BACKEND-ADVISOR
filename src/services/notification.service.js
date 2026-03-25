const Notification = require("../models/notification.model");
const RiskPrediction = require("../models/riskPrediction.model");
const Feedback = require("../models/feedback.model");
const AnomalyAlert = require("../models/anomalyAlert.model");
const User = require("../models/user.model");

class NotificationService {
    async createNotification(payload) {
        const now = new Date();
        const dedupeSince = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const duplicate = await Notification.findOne({
            recipient_user_id: payload.recipient_user_id,
            type: payload.type,
            "ref.collection_name": payload.ref?.collection_name,
            "ref.doc_id": payload.ref?.doc_id,
            sent_at: { $gte: dedupeSince },
        });

        if (duplicate) return null;

        return Notification.create({
            recipient_user_id: payload.recipient_user_id,
            type: payload.type,
            title: payload.title,
            content: payload.content,
            ref: payload.ref,
            is_read: false,
            sent_at: now,
        });
    }

    async listNotifications(body, currentUser) {
        const page = Number(body.page || 1);
        const limit = Number(body.limit || 20);
        const skip = (page - 1) * limit;

        const recipientUserId = currentUser.role === "ADMIN" ? body.recipient_user_id || currentUser.userId : currentUser.userId;

        const filter = { recipient_user_id: recipientUserId };
        if (typeof body.is_read === "boolean") filter.is_read = body.is_read;
        if (body.type) filter.type = body.type;

        const [items, total] = await Promise.all([
            Notification.find(filter).sort({ sent_at: -1 }).skip(skip).limit(limit),
            Notification.countDocuments(filter),
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

    async generateAlerts(body = {}) {
        const riskThreshold = Number(body.risk_threshold ?? 0.7);
        const negativeDays = Number(body.negative_days ?? 30);
        const studentUserId = body.student_user_id;
        const advisorUserId = body.advisor_user_id;

        const studentFilter = studentUserId ? { _id: studentUserId } : {};
        if (advisorUserId) {
            studentFilter["student_info.advisor_user_id"] = advisorUserId;
        }

        const students = await User.find({
            role: { $in: ["STUDENT", "user"] },
            ...studentFilter,
            "student_info.advisor_user_id": { $exists: true, $ne: null },
        }).select("_id student_info.advisor_user_id student_info.student_code profile.full_name");

        if (!students.length) {
            return { created_count: 0, details: { risk: 0, sentiment: 0, anomaly: 0 } };
        }

        const studentIds = students.map((s) => s._id);
        const advisorByStudent = new Map(students.map((s) => [String(s._id), s.student_info?.advisor_user_id]));
        const studentCodeById = new Map(students.map((s) => [String(s._id), s.student_info?.student_code || ""]));
        const studentNameById = new Map(students.map((s) => [String(s._id), s.profile?.full_name || ""]));

        let riskCreated = 0;
        let sentimentCreated = 0;
        let anomalyCreated = 0;

        const [riskRows, negativeFeedbackRows, anomalyRows] = await Promise.all([
            RiskPrediction.find({
                student_user_id: { $in: studentIds },
                is_latest: true,
                risk_score: { $gte: riskThreshold },
            })
                .select("_id student_user_id risk_score term_code predicted_at")
                .sort({ predicted_at: -1 }),
            Feedback.find({
                student_user_id: { $in: studentIds },
                label: "NEGATIVE",
                submitted_at: {
                    $gte: new Date(Date.now() - negativeDays * 24 * 60 * 60 * 1000),
                },
            })
                .select("_id student_user_id submitted_at")
                .sort({ submitted_at: -1 }),
            AnomalyAlert.find({
                student_user_id: { $in: studentIds },
                severity: "HIGH",
                status: "OPEN",
            })
                .select("_id student_user_id alert_type detected_at")
                .sort({ detected_at: -1 }),
        ]);

        for (const risk of riskRows) {
            const key = String(risk.student_user_id);
            const advisorId = advisorByStudent.get(key);
            if (!advisorId) continue;

            const created = await this.createNotification({
                recipient_user_id: advisorId,
                type: "RISK_ALERT",
                title: "High risk student detected",
                content: `Student ${studentCodeById.get(key) || key} has risk_score=${risk.risk_score.toFixed(2)}`,
                ref: {
                    collection_name: "risk_predictions",
                    doc_id: risk._id,
                },
            });

            if (created) riskCreated += 1;
        }

        for (const feedback of negativeFeedbackRows) {
            const key = String(feedback.student_user_id);
            const advisorId = advisorByStudent.get(key);
            if (!advisorId) continue;

            const created = await this.createNotification({
                recipient_user_id: advisorId,
                type: "SENTIMENT_ALERT",
                title: "Negative sentiment feedback",
                content: `Student ${studentCodeById.get(key) || key} reported negative sentiment`,
                ref: {
                    collection_name: "feedbacks",
                    doc_id: feedback._id,
                },
            });

            if (created) sentimentCreated += 1;
        }

        for (const anomaly of anomalyRows) {
            const key = String(anomaly.student_user_id);
            const advisorId = advisorByStudent.get(key);
            if (!advisorId) continue;

            const created = await this.createNotification({
                recipient_user_id: advisorId,
                type: "ANOMALY_ALERT",
                title: "High severity anomaly",
                content: `Student ${studentCodeById.get(key) || studentNameById.get(key) || key} has anomaly ${anomaly.alert_type}`,
                ref: {
                    collection_name: "anomaly_alerts",
                    doc_id: anomaly._id,
                },
            });

            if (created) anomalyCreated += 1;
        }

        return {
            created_count: riskCreated + sentimentCreated + anomalyCreated,
            details: {
                risk: riskCreated,
                sentiment: sentimentCreated,
                anomaly: anomalyCreated,
            },
        };
    }
}

module.exports = new NotificationService();
