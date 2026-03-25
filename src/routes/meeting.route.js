const express = require("express");
const meetingController = require("../controllers/meeting.controller");
const meetingValidator = require("../validations/meeting.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("ADVISOR", "ADMIN"),
    meetingValidator.createMeetingValidator,
    validate,
    meetingController.createMeeting
);

module.exports = router;
