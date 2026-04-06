const feedbackService = require("../services/feedback.service");

class FeedbackController {
    async submitFeedback(req, res, next) {
        try {
            const result = await feedbackService.submitFeedback(req.body, req.user?.userId);
            return res.status(201).json({ message: "Submit feedback successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async getFeedbackList(req, res, next) {
        try {
            const result = await feedbackService.getFeedbackList(req.body, req.user);
            return res.status(200).json({ message: "Get feedback list successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FeedbackController();
