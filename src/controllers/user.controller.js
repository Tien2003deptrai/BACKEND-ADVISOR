const userService = require("../services/user.service");

class UserController {
    async getUsers(req, res, next) {
        try {
            const result = await userService.getUsers(req.body);
            return res.status(200).json({ message: "Get users successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();

