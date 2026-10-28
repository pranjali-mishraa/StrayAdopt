const { Router } = require("express");
const adminAuthController = require("../controllers/adminAuth.controller");
const protectAdmin = require("../middlewares/adminAuth.middleware");

const adminRouter = Router();

adminRouter.post("/login", adminAuthController.loginAdminController);
adminRouter.post("/logout", protectAdmin, adminAuthController.logoutAdminController);
adminRouter.get("/me", protectAdmin, adminAuthController.getAdminMeController);

module.exports = adminRouter;