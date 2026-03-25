const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const dashboardValidator = require("../validations/dashboard.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.get(
    "/student",
    authMiddleware,
    authorizeRoles("STUDENT", "ADVISOR", "FACULTY", "ADMIN"),
    dashboardValidator.studentDashboardValidator,
    validate,
    dashboardController.getStudentDashboard
);

router.get(
    "/advisor",
    authMiddleware,
    authorizeRoles("ADVISOR", "FACULTY", "ADMIN"),
    dashboardValidator.advisorDashboardValidator,
    validate,
    dashboardController.getAdvisorDashboard
);

router.get(
    "/faculty",
    authMiddleware,
    authorizeRoles("FACULTY", "ADMIN"),
    dashboardValidator.facultyDashboardValidator,
    validate,
    dashboardController.getFacultyDashboard
);

module.exports = router;
