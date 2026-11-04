const postService = require("../services/post.service")


async function createPostController(req, res) {
    try {
        const { description, location } = req.body;

        if (!description || !location) {
            return res.status(400).json({
                message: "Description and location are required."
            });
        }

        const { id, model } = req.postOwner;

        const post = await postService.createPost({
            postBy: id,
            postByModel: model,
            description,
            location,
            files: req.files
        });

        return res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong"
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

async function getMyPostsController(req, res) {
    try {
        const { id, model } = req.postOwner;

        const posts = await postService.getMyPosts(id, model);

        return res.status(200).json({ posts });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong"
        });
    }
}

async function getPostByIdController(req, res) {
    try {
        const { id, model } = req.postOwner;
        const post = await postService.getPostById(req.params.id);
        return res.status(200).json({ post });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
        });
    }
}

async function updateDescriptionController(req, res) {
    try {
        const { id, model } = req.postOwner;
       // Update description
const post = await postService.updateDescription(
    req.params.id,
    id,
    model,
    req.body.description
);
        return res.status(200).json({ message: "Description updated", post });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}

async function updateLocationController(req, res) {
    try {
        const { id, model } = req.postOwner;
       // Update location
const post = await postService.updateLocation(
    req.params.id,
    id,
    model,
    req.body.location
);
        return res.status(200).json({ message: "Location updated", post });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}

async function updateImagesController(req, res) {
    try {
        const keepImages = req.body.keepImages ? JSON.parse(req.body.keepImages) : undefined;

        // Update images
const post = await postService.updateImages(
    req.params.id,
    id,
    model,
    {
        newFiles: req.files,
        keepImages
    }
);
        return res.status(200).json({ message: "Images updated", post });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}

async function toggleAdoptedStatusController(req, res) {
    try {
        const { id, model } = req.postOwner;
    // Toggle status
const post = await postService.toggleAdoptedStatus(
    req.params.id,
    id,
    model
);
        return res.status(200).json({ message: "Status updated", post });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}

async function deletePostController(req, res) {
    try {
        const { id, model } = req.postOwner;
       // Delete
await postService.deletePost(
    req.params.id,
    id,
    model
);
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
    }
}


module.exports = { createPostController,
     getLatestPostsController,
      getAllPostsController,
       getMyPostsController,
        getPostByIdController,
         updateDescriptionController,
         updateImagesController,
         updateLocationController,
         toggleAdoptedStatusController,
         deletePostController
        };