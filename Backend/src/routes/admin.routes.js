
const { Router } = require("express");
const adminAuthController = require("../controllers/adminAuth.controller");
const protectAdmin = require("../middlewares/adminAuth.middleware");

const adminRouter = Router();

// Admin authentication
adminRouter.post("/login", adminAuthController.loginAdminController);
adminRouter.post(
    "/logout",
    protectAdmin,
    adminAuthController.logoutAdminController
);
adminRouter.get(
    "/me",
    protectAdmin,
    adminAuthController.getAdminMeController
);

// NGO verification management
adminRouter.get(
    "/ngos",
    protectAdmin,
    adminAuthController.listNgosController
);

adminRouter.get(
    "/ngos/:id",
    protectAdmin,
    adminAuthController.getNgoController
);

adminRouter.patch(
    "/ngos/:id/approve",
    protectAdmin,
    adminAuthController.approveNgoController
);

adminRouter.patch(
    "/ngos/:id/reject",
    protectAdmin,
    adminAuthController.rejectNgoController
);

module.exports = adminRouter;
