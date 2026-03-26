const academicService = require("../services/academic.service");

class AcademicController {
    async submitAcademic(req, res, next) {
        try {
            const role = req.user?.role;
            const studentUserId = role === "STUDENT" ? req.user?.userId : req.body.student_user_id;
            const result = await academicService.submitAcademic(req.body, studentUserId);
            return res.status(201).json({ message: "Submit academic data successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AcademicController();
