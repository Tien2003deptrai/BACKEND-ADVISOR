const express = require("express");
const classMemberController = require("../controllers/classMember.controller");
const classMemberValidator = require("../validations/classMember.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post(
    "/add",
    authMiddleware,
    authorizeRoles("ADVISOR", "ADMIN"),
    classMemberValidator.addMembersValidator,
    validate,
    classMemberController.addMembers
);

router.get(
    "/list",
    authMiddleware,
    authorizeRoles("ADVISOR", "ADMIN"),
    classMemberValidator.listMembersValidator,
    validate,
    classMemberController.listMembers
);

module.exports = router;

