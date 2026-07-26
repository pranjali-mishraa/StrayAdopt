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



/**
 * @route GET /api/posts/getMyPosts
 * @description get posts posted by logged in user
 * @access only logged in user can see their own posts
 */

postRouter.get('/getMyPosts' ,protect, postController.getMyPostsController)


/**
 * @route GET /api/posts/:id
 * @description get full details of the single post 
 * @access public
 */
postRouter.get('/:id' , postController.getPostByIdController)

module.exports = postRouter;