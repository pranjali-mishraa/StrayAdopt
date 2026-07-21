const authService = require("../services/auth.service");

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { token, user } = await authService.registerUser({ username, email, password });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { token, user } = await authService.loginUser({ email, password });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ message: "User logged in successfully", user });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

async function getMeController(req, res) {
    return res.status(200).json({ user: req.user });
}


async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;
         await authService.logoutUser(token)
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}



module.exports = { registerUserController, loginUserController , getMeController , logoutUserController};