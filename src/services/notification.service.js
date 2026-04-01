const Notification = require("../models/notification.model");
const RiskPrediction = require("../models/riskPrediction.model");
const AnomalyAlert = require("../models/anomalyAlert.model");
const Feedback = require("../models/feedback.model");
const AdvisorClass = require("../models/advisorClass.model");
const ClassMember = require("../models/classMember.model");
const User = require("../models/user.model");
const Term = require("../models/term.model");

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
            term_id: payload.term_id,
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

    async generateAlerts(body = {}, currentUser = null) {
        const riskThreshold = Number(body.risk_threshold ?? 0.7);
        const negativeDays = Number(body.negative_days ?? 30);
        const studentUserId = body.student_user_id;
        const advisorUserId = currentUser?.role === "ADVISOR" ? currentUser.userId : body.advisor_user_id;

        const classFilter = { status: "ACTIVE" };
        if (advisorUserId) classFilter.advisor_user_id = advisorUserId;

        const advisorClasses = await AdvisorClass.find(classFilter).select("_id advisor_user_id");
        if (!advisorClasses.length) {
            return { created_count: 0, details: { risk: 0, sentiment: 0, anomaly: 0 } };
        }

        const classIds = advisorClasses.map((item) => item._id);
        const memberFilter = { class_id: { $in: classIds }, status: "ACTIVE" };
        if (studentUserId) memberFilter.student_user_id = studentUserId;

        const members = await ClassMember.find(memberFilter).select("class_id student_user_id");
        if (!members.length) {
            return { created_count: 0, details: { risk: 0, sentiment: 0, anomaly: 0 } };
        }

        const advisorByClassId = new Map(advisorClasses.map((item) => [String(item._id), item.advisor_user_id]));
        const advisorByStudent = new Map(
            members
                .map((item) => [String(item.student_user_id), advisorByClassId.get(String(item.class_id))])
                .filter(([, advisorId]) => !!advisorId)
        );

        const studentIds = Array.from(new Set(members.map((item) => String(item.student_user_id))));
        if (!studentIds.length) {
            return { created_count: 0, details: { risk: 0, sentiment: 0, anomaly: 0 } };
        }

        const students = await User.find({ _id: { $in: studentIds }, role: "STUDENT" }).select(
            "_id student_info.student_code profile.full_name"
        );
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
                .select("_id student_user_id risk_score term_id predicted_at")
                .populate("term_id", "term_code")
                .sort({ predicted_at: -1 }),
            Feedback.find({
                student_user_id: { $in: studentIds },
                sentiment_label: "NEGATIVE",
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
                .select("_id student_user_id term_code alert_type detected_at")
                .sort({ detected_at: -1 }),
        ]);

        const anomalyTermCodes = Array.from(
            new Set(anomalyRows.map((row) => String(row.term_code || "").trim().toUpperCase()).filter(Boolean))
        );
        const termsByCode = anomalyTermCodes.length
            ? await Term.find({ term_code: { $in: anomalyTermCodes } }).select("_id term_code")
            : [];
        const termIdByCode = new Map(termsByCode.map((term) => [String(term.term_code || "").trim().toUpperCase(), term._id]));

        for (const risk of riskRows) {
            const key = String(risk.student_user_id);
            const advisorId = advisorByStudent.get(key);
            if (!advisorId) continue;

            const created = await this.createNotification({
                recipient_user_id: advisorId,
                type: "RISK_ALERT",
                title: "High risk student detected",
                content: `Student ${studentCodeById.get(key) || key} has risk_score=${risk.risk_score.toFixed(2)}`,
                term_id: risk.term_id?._id,
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
                term_id: termIdByCode.get(String(anomaly.term_code || "").trim().toUpperCase()),
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
