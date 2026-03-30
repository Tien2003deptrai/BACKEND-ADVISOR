const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const feedbackValidator = require("../validations/feedback.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("STUDENT"),
    feedbackValidator.submitFeedbackValidator,
    validate,
    feedbackController.submitFeedback
);

router.post(
    "/list",
    authMiddleware,
    authorizeRoles("STUDENT", "ADVISOR", "FACULTY", "ADMIN"),
    feedbackValidator.listFeedbackValidator,
    validate,
    feedbackController.getFeedbackList
);

module.exports = router;
