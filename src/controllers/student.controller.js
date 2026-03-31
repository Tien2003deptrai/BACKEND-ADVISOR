const studentService = require("../services/student.service");

class StudentController {
    async getStudents(req, res, next) {
        try {
            const result = await studentService.getStudents(req.body);
            return res.status(200).json({ message: "Get students successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async getStudentById(req, res, next) {
        try {
            const result = await studentService.getStudentById(req.params.id);
            return res.status(200).json({ message: "Get student successfully", data: result });
        } catch (error) {
            next(error);
        }
    }

    async getMyAdvisor(req, res, next) {
        try {
            const result = await studentService.getMyAdvisor(req.user?.userId);
            return res.status(200).json({ message: "Get my advisor successfully", data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new StudentController();
