const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ngoModel = require("../models/ngo.model");
const blacklistTokenModel = require("../models/blacklistToken.model");

function httpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Never expose the password hash
function formatNgo(ngo) {
    return {
        _id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        image: ngo.image,
        verificationStatus: ngo.verificationStatus,
    };
}

// The role claim lets NGO middleware tell this token apart from a user or admin token.
// verificationStatus is deliberately NOT in the token because it changes on admin approval.
function generateNgoToken(ngo) {
    return jwt.sign(
        { id: ngo._id, email: ngo.email, role: "ngo" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// image and verificationDocuments[].url are Cloudinary URLs uploaded by the controller.
// location.coordinates is [longitude, latitude].
async function registerNgo({
    name,
    description,
    email,
    password,
    image,
    address,
    location,
    contact,
    verificationDocuments,
}) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingNgo = await ngoModel.findOne({ email: normalizedEmail });
    if (existingNgo) {
        throw httpError("An NGO is already registered with this email", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const ngo = await ngoModel.create({
            name,
            description,
            email: normalizedEmail,
            password: hashedPassword,
            image,
            address,
            location: { type: "Point", coordinates: location?.coordinates },
            contact: {
                phone: contact?.phone,
                website: contact?.website,
            },
            verificationDocuments: (verificationDocuments || []).map((doc) => ({
                label: doc.label,
                url: doc.url,
            })),
            verificationStatus: "pending", // never taken from input
        });

        return { ngo: formatNgo(ngo) };
    } catch (error) {
        if (error.code === 11000) {
            // Two registrations raced past the findOne check
            throw httpError("An NGO is already registered with this email", 409);
        }
        if (error.name === "ValidationError") {
            throw httpError(error.message, 400);
        }
        throw error;
    }
}

async function loginNgo({ email, password }) {
    const ngo = await ngoModel
        .findOne({ email: email.trim().toLowerCase() })
        .select("+password");

    if (!ngo) {
        throw httpError("Invalid email or password", 400);
    }

    const isPasswordValid = await bcrypt.compare(password, ngo.password);
    if (!isPasswordValid) {
        throw httpError("Invalid email or password", 400);
    }

    // Checked after the password so status isn't revealed to anyone without credentials
    if (ngo.verificationStatus === "rejected") {
        throw httpError("Your NGO application has been rejected", 403);
    }

    // "pending" may log in; publishing is blocked by requireVerifiedNgo
    return { token: generateNgoToken(ngo), ngo: formatNgo(ngo) };
}

async function logoutNgo(token) {
    if (!token) {
        throw httpError("Token not provided", 400);
    }

    const decoded = jwt.decode(token);
    if (!decoded || decoded.role !== "ngo" || !decoded.exp) {
        throw httpError("Invalid NGO token", 400);
    }

    await blacklistTokenModel.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),
    });

    return true;
}

module.exports = { registerNgo, loginNgo, logoutNgo };