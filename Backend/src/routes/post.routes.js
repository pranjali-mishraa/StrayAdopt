const {Router} = require("express");
const postController = require("../controllers/post.controller");
const protect = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");


const postRouter = Router();

/**
 * @route POST /api/posts/create
 * @description lets user create post
 * @access private
 */

postRouter.post('/create', protect, upload.array("images", 5), postController.createPostController);



/**
 * @route GET /api/posts/latest
 * @description latest post for homepage
 * @access public as for home page 
 */

postRouter.get('/latest' , postController.getLatestPostsController);



/**
 * @route  GET /api/posts/allPosts
 * @description gets all the posts to display all the pet on explore page 
 * @access public everyone should be able to see all pets
 */

postRouter.get('/allPosts' , postController.getAllPostsController)

module.exports = postRouter;