const cloudinary = require("../config/cloudinary");
const postModel = require("../models/post.model");

function uploadImageToCloudinary(fileBuffer){
    return new Promise ((resolve, reject)=>{
        const stream = cloudinary.uploader.upload_stream(
            {folder : strayAdopt/posts},
            
            (error , result)=>{
                if(error){
                    return reject(error);
                }else{
                    resolve(result.secure_url);
                }
            }
        )

        stream.end(fileBuffer);
    })
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

    const uploadPromises = files.map((file)=>uploadImageToCloudinary(file.Buffer))
    const imageUrls = await Promise.all(uploadPromises);

    const post = await postModel.create({
        postBy,
        images : imageUrls,
        description,
        location
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

module.exports = { createPost, getLatestPosts, getAllPosts };



