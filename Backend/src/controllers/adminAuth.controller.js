
const adminAuthService = require("../services/adminAuth.service");

const fail = (res, error) =>
    res.status(error.statusCode || 500).json({
        message: error.message || "Something went wrong",
    });

// Admin login
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

        return res.status(200).json({
            message: "Admin logged in successfully",
            token,
            admin,
        });
    } catch (error) {
        return fail(res, error);
    }
}

// Admin logout
async function logoutAdminController(req, res) {
    try {
        await adminAuthService.logoutAdmin(req.authToken);

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        return fail(res, error);
    }
}

// Get logged-in admin
async function getAdminMeController(req, res) {
    return res.status(200).json({
        admin: req.admin,
    });
}

// List NGOs
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

// Get NGO details
async function getNgoController(req, res) {
    try {
        const ngo = await adminAuthService.getNgoDetails(req.params.id);

        return res.status(200).json({ ngo });
    } catch (error) {
        return fail(res, error);
    }
}

// Approve NGO
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

// Reject NGO
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
