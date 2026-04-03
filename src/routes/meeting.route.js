const express = require("express");
const meetingController = require("../controllers/meeting.controller");
const meetingValidator = require("../validations/meeting.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");
const uploadMeetingFile = require("../middlewares/uploadMeetingFile.middleware");

const router = express.Router();

router.post(
    "/my",
    authMiddleware,
    authorizeRoles("STUDENT"),
    meetingValidator.listMyMeetingsValidator,
    validate,
    meetingController.listMyMeetings
);

router.post(
    "/my-info",
    authMiddleware,
    authorizeRoles("STUDENT"),
    meetingValidator.listMyMeetingsValidator,
    validate,
    meetingController.getInfoMeeting
);

router.post(
    "/advisor/list",
    authMiddleware,
    authorizeRoles("ADVISOR"),
    meetingValidator.listMyMeetingsValidator,
    validate,
    meetingController.listAdvisorMeetings
);

router.post(
    "/",
    authMiddleware,
    authorizeRoles("ADVISOR"),
    uploadMeetingFile.single("file"),
    meetingValidator.createMeetingValidator,
    validate,
    meetingController.createMeeting
);

module.exports = router;
