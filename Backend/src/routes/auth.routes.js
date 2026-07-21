const {Router} = require('express');
const authController = require('../controllers/auth.controller')
const protect = require('../middlewares/auth.middleware')

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user 
 * @access Public
 */

authRouter.post('/register', authController.registerUserController );


/**
 * @route POST /api/auth/login
 * @description Login a use with email and password 
 * @access Public 
 */

authRouter.post('/login' , authController.loginUserController);

/**
 * @route GET /api/auth/me
 * @description get user details of self when user clicks on profile
 * @access Private
 */
 
authRouter.get('/me',protect , authController.getMeController)

module.exports = authRouter 

