const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser({ username, email, password }) {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 400;
        throw error;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ username, email, password: hash });

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: { id: user._id, username: user.username, email: user.email },
    };
}

async function loginUser({ email, password }) {
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: { id: user._id, username: user.username, email: user.email },
    };
}

module.exports = { registerUser, loginUser };