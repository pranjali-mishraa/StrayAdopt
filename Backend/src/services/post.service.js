const cloudinary = require("../config/cloudinary");
const postModel = require("../models/post.model");
const { generateEmbedding } = require("./embedding.service");
const { uploadToCloudinary } = require("./upload.service");

async function uploadImageToCloudinary(fileBuffer) {
    const result = await uploadToCloudinary(fileBuffer, "strayAdopt/posts");
    return result.secure_url;
}


async function createPost({postBy , description , location , files}){
    if(!files || files.length === 0 ){
        const error = new Error("No images selected , atleast one image is required");
        error.statusCode = 400 ;
        throw error ;
    }

    if(files.length > 5){
        const error =  new Error("Only 5 images are allowed per post");
        error.statusCode = 400 ;
        throw error ; 
    }


    const uploadPromises = files.map((file)=>uploadImageToCloudinary(file.buffer))
    const imageUrls = await Promise.all(uploadPromises);

            const textToEmbed = `
            Description: ${description}
            Location: ${location}
            Status: available
        `.trim();

        const embedding = await generateEmbedding(textToEmbed);


    const post = await postModel.create({
        postBy,
        images : imageUrls,
        description,
        location,
        embedding
    });

    return post ; 
}

async function getLatestPosts(limit = 6 ){
    const posts = await postModel.find()
    .sort({createdAt:-1})
    .limit(limit)
    .populate("postBy" , "username email");

    return posts; 
}

async function getAllPosts({ page = 1, limit = 12 }) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        postModel
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("postBy", "username email"),
        postModel.countDocuments(),
    ]);

    return {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

async function getMyPosts(userId){
const posts = await postModel.find({postBy:userId})
            .sort({createdAt:-1})
            .populate("postBy" , "username email")
    return posts
}


async function getPostById(postId){
    const post = await postModel.findById(postId)
                    .populate("postBy" , "username email")

    if(!post){
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
    }

    return post; 

}


async function getOwnedPost ( postId , userId){

    const post = await postModel.findById(postId);

    if(!post){
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error
    }

    if(post.postBy.toString()!==userId.toString()){
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error
    }

    return post ;

}

async function updateDescription(postId , userId , description){

        if(!description || !description.trim()){
            const error = new Error("Description cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        const post = await getOwnedPost(postId,userId);
        post.description = description;
        await post.save()
        return post ; 

}

async function updateLocation(postId , userId , location){

        if(!location || !location.trim()){
            const error = new Error("Location cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        const post = await getOwnedPost(postId , userId)
        post.location = location
        await post.save()
        return post
}

async function updateImages(postId, userId, { newFiles, keepImages }) {
    const post = await getOwnedPost(postId, userId);

    let finalImages = keepImages ?? post.images;

    if (newFiles && newFiles.length > 0) {
        const uploadPromises = newFiles.map((file) => uploadImageToCloudinary(file.buffer));
        const newUrls = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...newUrls];
    }

    if (finalImages.length === 0) {
        const error = new Error("A post must have at least one image");
        error.statusCode = 400;
        throw error;
    }

    if (finalImages.length > 5) {
        const error = new Error("A post can contain a maximum of 5 images");
        error.statusCode = 400;
        throw error;
    }

    post.images = finalImages;
    await post.save();
    return post;
}

async function toggleAdoptedStatus(postId , userId){
        const post = await getOwnedPost(postId , userId)
        post.status = post.status === "available" ? "adopted" : "available";
        await post.save();
        return post;
}

async function deletePost (postId , userId){

    const post = await getOwnedPost(postId , userId)
    await post.deleteOne();
    return true ; 

}

async function getPostsByOwner(ownerId, { page = 1, limit = 12 }) {
    const filter = { postBy: ownerId };
    const [posts, total] = await Promise.all([
        postModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate(OWNER_POPULATE),
        postModel.countDocuments(filter),
    ]);
    return { posts, total, page, totalPages: Math.ceil(total / limit) };
}

module.exports = { createPost,
     getLatestPosts,
     getAllPosts,
     getMyPosts,
     getPostById,
    updateDescription,
    updateImages,
    updateLocation,
    toggleAdoptedStatus,
    deletePost,
    getPostsByOwner
    };



