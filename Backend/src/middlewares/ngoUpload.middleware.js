const multer = require("multer");

const storage = multer.memoryStorage();

const registrationUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 6 },
    fileFilter: (req, file, cb) =>
        ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Only JPEG, PNG, WEBP images and PDFs are allowed"), false),
}).fields([
    { name: "image", maxCount: 1 },
    { name: "documents", maxCount: 5 },
]);

const highlightUpload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) =>
        /^(image|video)\//.test(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Only images and videos are allowed"), false),
}).single("media");

module.exports = { registrationUpload, highlightUpload };