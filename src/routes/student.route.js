const express = require("express");
const studentController = require("../controllers/student.controller");
const studentValidator = require("../validations/student.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("ADVISOR", "FACULTY", "ADMIN"),
    studentValidator.listStudentsValidator,
    validate,
    studentController.getStudents
);
router.post(
    "/:id",
    authMiddleware,
    authorizeRoles("ADVISOR", "FACULTY", "ADMIN"),
    studentValidator.getStudentByIdValidator,
    validate,
    studentController.getStudentById
);

module.exports = router;
