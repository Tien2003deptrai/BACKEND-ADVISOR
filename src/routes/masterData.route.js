const express = require("express");
const masterDataController = require("../controllers/masterData.controller");
const masterDataValidator = require("../validations/masterData.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorize.middleware");

const router = express.Router();

router.post(
    "/departments",
    authMiddleware,
    authorizeRoles("ADMIN"),
    masterDataValidator.createDepartmentValidator,
    validate,
    masterDataController.createDepartment
);

router.post(
    "/departments/list",
    authMiddleware,
    masterDataValidator.listDepartmentsValidator,
    validate,
    masterDataController.listDepartments
);

router.post(
    "/majors",
    authMiddleware,
    authorizeRoles("ADMIN"),
    masterDataValidator.createMajorValidator,
    validate,
    masterDataController.createMajor
);

router.post(
    "/majors/list",
    authMiddleware,
    masterDataValidator.listMajorsValidator,
    validate,
    masterDataController.listMajors
);

router.post(
    "/terms",
    authMiddleware,
    authorizeRoles("ADMIN"),
    masterDataValidator.createTermValidator,
    validate,
    masterDataController.createTerm
);

router.post(
    "/terms/list",
    authMiddleware,
    masterDataValidator.listTermsValidator,
    validate,
    masterDataController.listTerms
);

router.get(
    "/terms/active",
    authMiddleware,
    masterDataController.getActiveTerm
);

module.exports = router;
