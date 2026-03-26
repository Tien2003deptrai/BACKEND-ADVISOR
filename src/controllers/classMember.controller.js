const classMemberService = require("../services/classMember.service");

class ClassMemberController {
    async addMembers(req, res, next) {
        try {
            const result = await classMemberService.addMembers(req.body, req.user);
            return res.status(200).json({ message: "Add class members successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async listMembers(req, res, next) {
        try {
            const result = await classMemberService.listMembers(req.body, req.user);
            return res.status(200).json({ message: "Get class members successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ClassMemberController();

