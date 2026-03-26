const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const dashboardValidator = require("../validations/dashboard.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post(
    "/student",
    authMiddleware,
    authorizeRoles("STUDENT"),
    dashboardValidator.studentDashboardValidator,
    validate,
    dashboardController.getStudentDashboard
);

router.post(
    "/advisor",
    authMiddleware,
    authorizeRoles("ADVISOR"),
    dashboardValidator.advisorDashboardValidator,
    validate,
    dashboardController.getAdvisorDashboard
);

router.post(
    "/faculty",
    authMiddleware,
    authorizeRoles("FACULTY", "ADMIN"),
    dashboardValidator.facultyDashboardValidator,
    validate,
    dashboardController.getFacultyDashboard
);

module.exports = router;
