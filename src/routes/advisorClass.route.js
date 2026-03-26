const express = require("express");
const advisorClassController = require("../controllers/advisorClass.controller");
const advisorClassValidator = require("../validations/advisorClass.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("ADVISOR", "ADMIN"),
    advisorClassValidator.upsertClassValidator,
    validate,
    advisorClassController.upsertClass
);

router.get(
    "/my",
    authMiddleware,
    authorizeRoles("ADVISOR", "ADMIN"),
    advisorClassValidator.getMyClassValidator,
    validate,
    advisorClassController.getMyClass
);

module.exports = router;

