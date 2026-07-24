const postService = require("../services/post.service")

async function createPostController(req , res){

    try {
        const {description , location} = req.body ;

    if(!description || !location){
        return res.status(400).json({
            message: "Description and message both are required."
        })
    }

    const post = await postService.createPost({
        postBy : req.user._id,
        description ,
        location,
        files :req.files,
    })

    return res.status(200).json({message: " Post created successfully" , post})
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }

}

async function getLatestPostsController(req , res){
    try {
        const latestPost = await postService.getLatestPosts(6)
       return res.status(200).json({latestPost})
    } catch (error) {
       return res.status(500).json({ message : error.message|| "Something went wrong"})
    }
}

async function getAllPostsController(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        const result = await postService.getAllPosts({ page, limit });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}

module.exports = { createPostController, getLatestPostsController, getAllPostsController };