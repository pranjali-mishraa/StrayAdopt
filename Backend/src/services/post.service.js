
const postModel = require("../models/post.model");
const { generateEmbedding } = require("./embedding.service");
const { uploadToCloudinary } = require("./upload.service");

const OWNER_POPULATE = {
    path: "postBy",
    select: "username name email image",
};

function httpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function uploadImageToCloudinary(fileBuffer) {
    const result = await uploadToCloudinary(
        fileBuffer,
        "strayAdopt/posts"
    );

    return result.secure_url;
}


// Create post for either User or NGO
async function createPost({
    postBy,
    postByModel,
    description,
    location,
    files
}) {
    if (!["User", "Ngo"].includes(postByModel)) {
        throw httpError("Invalid post owner type", 400);
    }

    if (!files || files.length === 0) {
        throw httpError(
            "At least one image is required",
            400
        );
    }

    if (files.length > 5) {
        throw httpError("Only 5 images are allowed", 400);
    }

    const uploadPromises = files.map(file =>
        uploadImageToCloudinary(file.buffer)
    );

    const imageUrls = await Promise.all(uploadPromises);

    const textToEmbed = `
        Description: ${description}
        Location: ${location}
        Status: available
    `.trim();

    const embedding = await generateEmbedding(textToEmbed);

    const post = await postModel.create({
        postBy,
        postByModel,
        images: imageUrls,
        description,
        location,
        embedding
    });

    return post;
}


// Latest posts
async function getLatestPosts(limit = 6) {
    return postModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate(OWNER_POPULATE);
}


// All posts with pagination
async function getAllPosts({ page = 1, limit = 12 }) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        postModel
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate(OWNER_POPULATE),

        postModel.countDocuments()
    ]);

    return {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}


// Get posts belonging to current User or NGO
async function getMyPosts(ownerId, ownerModel) {
    return postModel
        .find({
            postBy: ownerId,
            postByModel: ownerModel
        })
        .sort({ createdAt: -1 })
        .populate(OWNER_POPULATE);
}


// Get posts belonging to a public owner
async function getPostsByOwner(
    ownerId,
    ownerModel,
    { page = 1, limit = 12 } = {}
) {
    const filter = {
        postBy: ownerId,
        postByModel: ownerModel
    };

    const [posts, total] = await Promise.all([
        postModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate(OWNER_POPULATE),

        postModel.countDocuments(filter)
    ]);

    return {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}


// Get individual post
async function getPostById(postId) {
    const post = await postModel
        .findById(postId)
        .populate(OWNER_POPULATE);

    if (!post) {
        throw httpError("Post not found", 404);
    }

    return post;
}


// Find and authorize an owned post
async function getOwnedPost(postId, ownerId, ownerModel) {
    const post = await postModel.findById(postId);

    if (!post) {
        throw httpError("Post not found", 404);
    }

    const isOwner =
        post.postBy.toString() === ownerId.toString() &&
        post.postByModel === ownerModel;

    if (!isOwner) {
        throw httpError("Not authorized", 403);
    }

    return post;
}


// Update description
async function updateDescription(
    postId,
    ownerId,
    ownerModel,
    description
) {
    if (!description || !description.trim()) {
        throw httpError("Description cannot be empty", 400);
    }

    const post = await getOwnedPost(
        postId,
        ownerId,
        ownerModel
    );

    post.description = description.trim();

    await post.save();

    return post;
}


// Update location
async function updateLocation(
    postId,
    ownerId,
    ownerModel,
    location
) {
    if (!location || !location.trim()) {
        throw httpError("Location cannot be empty", 400);
    }

    const post = await getOwnedPost(
        postId,
        ownerId,
        ownerModel
    );

    post.location = location.trim();

    await post.save();

    return post;
}


// Update images
async function updateImages(
    postId,
    ownerId,
    ownerModel,
    { newFiles, keepImages }
) {
    const post = await getOwnedPost(
        postId,
        ownerId,
        ownerModel
    );

    let finalImages = keepImages ?? post.images;

    if (newFiles && newFiles.length > 0) {
        const uploadPromises = newFiles.map(file =>
            uploadImageToCloudinary(file.buffer)
        );

        const newUrls = await Promise.all(uploadPromises);

        finalImages = [...finalImages, ...newUrls];
    }

    if (finalImages.length === 0) {
        throw httpError("A post must have at least one image", 400);
    }

    if (finalImages.length > 5) {
        throw httpError("A post can contain a maximum of 5 images", 400);
    }

    post.images = finalImages;

    await post.save();

    return post;
}


// Toggle adoption status
async function toggleAdoptedStatus(
    postId,
    ownerId,
    ownerModel
) {
    const post = await getOwnedPost(
        postId,
        ownerId,
        ownerModel
    );

    post.status =
        post.status === "available" ? "adopted" : "available";

    await post.save();

    return post;
}


// Delete post
async function deletePost(postId, ownerId, ownerModel) {
    const post = await getOwnedPost(
        postId,
        ownerId,
        ownerModel
    );

    await post.deleteOne();

    return true;
}


module.exports = {
    createPost,
    getLatestPosts,
    getAllPosts,
    getMyPosts,
    getPostById,
    getPostsByOwner,
    updateDescription,
    updateImages,
    updateLocation,
    toggleAdoptedStatus,
    deletePost
};
