
const adminAuthService = require("../services/adminAuth.service");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

const fail = (res, error) =>
    res.status(error.statusCode || 500).json({
        message: error.message || "Something went wrong",
    });

async function loginAdminController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const { token, admin } = await adminAuthService.loginAdmin({
            email,
            password,
        });

        res.cookie("adminToken", token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Admin logged in successfully",
            admin,
        });
    } catch (error) {
        return fail(res, error);
    }
}

async function logoutAdminController(req, res) {
    try {
        await adminAuthService.logoutAdmin(req.cookies.adminToken);
        res.clearCookie("adminToken", cookieOptions);

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        return fail(res, error);
    }
}

async function getAdminMeController(req, res) {
    return res.status(200).json({ admin: req.admin });
}

// List NGOs, filtered by verification status.
async function listNgosController(req, res) {
    try {
        const ngos = await adminAuthService.listNgos(
            req.query.status || "pending"
        );

        return res.status(200).json({ ngos });
    } catch (error) {
        return fail(res, error);
    }
}

// Get a single NGO with verification document URLs.
async function getNgoController(req, res) {
    try {
        const ngo = await adminAuthService.getNgoDetails(req.params.id);

        return res.status(200).json({ ngo });
    } catch (error) {
        return fail(res, error);
    }
}

// Approve an NGO.
async function approveNgoController(req, res) {
    try {
        const ngo = await adminAuthService.approveNgo(req.params.id);

        return res.status(200).json({
            message: "NGO approved successfully",
            ngo,
        });
    } catch (error) {
        return fail(res, error);
    }
}

// Reject an NGO.
async function rejectNgoController(req, res) {
    try {
        const ngo = await adminAuthService.rejectNgo(
            req.params.id,
            req.body.reason
        );

        return res.status(200).json({
            message: "NGO rejected successfully",
            ngo,
        });
    } catch (error) {
        return fail(res, error);
    }
}

module.exports = {
    loginAdminController,
    logoutAdminController,
    getAdminMeController,
    listNgosController,
    getNgoController,
    approveNgoController,
    rejectNgoController,
};
