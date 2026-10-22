
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const blacklistTokenModel = require("../models/blacklistToken.model");

function httpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function formatAdmin(admin) {
    return {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
    };
}

async function loginAdmin({ email, password }) {
    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw httpError("Email and password are required", 400);
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const admin = await adminModel
        .findOne({ email: email.trim().toLowerCase() })
        .select("+password");

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        throw httpError("Invalid email or password", 401);
    }

    const token = jwt.sign(
        {
            id: admin._id.toString(),
            email: admin.email,
            role: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        admin: formatAdmin(admin),
    };
}

async function logoutAdmin(token) {
    if (!token) {
        throw httpError("Token not provided", 400);
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw httpError("Invalid or expired admin token", 401);
    }

    if (decoded.role !== "admin" || !decoded.exp || !decoded.id) {
        throw httpError("Invalid admin token", 401);
    }

    const existingToken = await blacklistTokenModel.findOne({ token });

    if (!existingToken) {
        await blacklistTokenModel.create({
            token,
            expiresAt: new Date(decoded.exp * 1000),
        });
    }

    return true;
}

module.exports = { loginAdmin, logoutAdmin };

