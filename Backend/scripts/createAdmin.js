require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../src/config/database");
const adminModel = require("../src/models/admin.model");

async function run() {
    const name = process.env.ADMIN_NAME || "Admin";
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || password.length < 8) {
        console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) in .env first.");
        process.exit(1);
    }

    await connectDB();

    if (await adminModel.findOne({ email: email.toLowerCase() })) {
        console.log("An admin with this email already exists.");
    } else {
        await adminModel.create({ name, email, password: await bcrypt.hash(password, 10) });
        console.log(`Admin created: ${email}`);
    }

    await mongoose.disconnect();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});