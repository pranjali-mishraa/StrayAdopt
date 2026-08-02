const transporter = require("../config/mailer");

async function sendOtpEmail(toEmail, otp, purpose) {
    const subjectMap = {
        register: "Verify your StrayAdopt account",
        "reset-password": "Reset your StrayAdopt password",
    };

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: toEmail,
        subject: subjectMap[purpose] || "Your StrayAdopt OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                <h2>Your OTP Code</h2>
                <p>Use the code below to continue. This code expires in 5 minutes.</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>If you did not request this, you can safely ignore this email.</p>
            </div>
        `,
    });
}

module.exports = { sendOtpEmail };