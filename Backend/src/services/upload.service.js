const cloudinary = require("../config/cloudinary");

function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "auto" },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
    });
}

module.exports = { uploadToCloudinary };