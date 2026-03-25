const notificationService = require("../services/notification.service");

class NotificationController {
    async listNotifications(req, res, next) {
        try {
            const result = await notificationService.listNotifications(req.body, req.user);
            return res.status(200).json({ message: "Get notifications successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async generateAlerts(req, res, next) {
        try {
            const result = await notificationService.generateAlerts(req.body);
            return res.status(200).json({ message: "Generate notifications successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();
