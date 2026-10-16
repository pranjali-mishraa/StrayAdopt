const ngoAuthService = require("../services/ngo.service");
const { uploadToCloudinary } = require("../services/upload.service");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

async function registerNgoController(req, res) {
    try {
        const { name, description, email, password, address, latitude, longitude, phone, website } = req.body;
        const imageFile = req.files?.image?.[0];
        const docFiles = req.files?.documents || [];

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (!name || !description || !email || !password) {
            return res.status(400).json({ message: "Name, description, email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({ message: "A valid location is required" });
        }
        if (!imageFile) {
            return res.status(400).json({ message: "An NGO profile image is required" });
        }
        if (docFiles.length === 0) {
            return res.status(400).json({ message: "At least one verification document is required" });
        }

        const image = (await uploadToCloudinary(imageFile.buffer, "strayadopt/ngos")).secure_url;
        const verificationDocuments = await Promise.all(
            docFiles.map(async (file) => ({
                label: file.originalname,
                url: (await uploadToCloudinary(file.buffer, "strayadopt/ngo-documents")).secure_url,
            }))
        );

        const { ngo } = await ngoAuthService.registerNgo({
            name,
            description,
            email,
            password,
            image,
            address,
            location: { coordinates: [lng, lat] }, // [longitude, latitude]
            contact: { phone, website },
            verificationDocuments,
        });

        return res.status(201).json({
            message: "Registration submitted. You can publish once an admin approves your NGO.",
            ngo,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}

async function loginNgoController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const { token, ngo } = await ngoAuthService.loginNgo({ email, password });
        res.cookie("ngoToken", token, cookieOptions);

        return res.status(200).json({ message: "NGO logged in successfully", ngo });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}

async function logoutNgoController(req, res) {
    try {
        await ngoAuthService.logoutNgo(req.cookies.ngoToken);
        res.clearCookie("ngoToken", cookieOptions);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}

async function getNgoMeController(req, res) {
    return res.status(200).json({ ngo: req.ngo });
}

module.exports = { registerNgoController, loginNgoController, logoutNgoController, getNgoMeController };