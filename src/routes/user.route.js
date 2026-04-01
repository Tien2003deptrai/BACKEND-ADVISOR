const express = require("express");
const userController = require("../controllers/user.controller");
const userValidator = require("../validations/user.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post("/create",
    authMiddleware,
    authorizeRoles("ADMIN", "ADVISOR"),
    userValidator.createUserValidator,
    validate,
    userController.createUser
);

router.post(
    "/info",
    authMiddleware,
    authorizeRoles("ADVISOR", "FACULTY", "ADMIN"),
    userValidator.getUserInfoValidator,
    validate,
    userController.getUserInfo
);

// cho advisor và admin
router.post("/",
    authMiddleware,
    authorizeRoles("ADMIN", "ADVISOR"),
    userValidator.listUsersValidator,
    validate,
    userController.getUsers
);

module.exports = router;
