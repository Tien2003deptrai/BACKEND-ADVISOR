const authService = require("../services/auth.service");

class AuthController {
    async register(req, res, next) {
        try {
            const userData = req.body;
            const result = await authService.register(userData);
            return res.status(201).json({ message: "Register successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const userData = req.body;
            const result = await authService.login(userData);
            return res.status(200).json({ message: "Login successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const result = await authService.logout();
            return res.status(200).json({ message: "Logout successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
