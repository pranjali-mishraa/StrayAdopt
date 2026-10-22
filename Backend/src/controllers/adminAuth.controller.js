const adminAuthService = require("../services/adminAuth.service");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

const fail = (res, error) =>
    res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });

async function loginAdminController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { token, admin } = await adminAuthService.loginAdmin({ email, password });
        res.cookie("adminToken", token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });

        return res.status(200).json({ message: "Admin logged in successfully", admin });
    } catch (error) { return fail(res, error); }
}

async function logoutAdminController(req, res) {
    try {
        await adminAuthService.logoutAdmin(req.cookies.adminToken);
        res.clearCookie("adminToken", cookieOptions);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) { return fail(res, error); }
}

async function getAdminMeController(req, res) {
    return res.status(200).json({ admin: req.admin });
}

module.exports = { loginAdminController, logoutAdminController, getAdminMeController };