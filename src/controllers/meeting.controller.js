const meetingService = require("../services/meeting.service");

class MeetingController {
    async createMeeting(req, res, next) {
        try {
            const role = req.user?.role;
            const advisorUserId = role === "ADVISOR" ? req.user?.userId : req.body.advisor_user_id;
            const result = await meetingService.createMeeting(req.body, advisorUserId);
            return res.status(201).json({ message: "Create meeting successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MeetingController();
