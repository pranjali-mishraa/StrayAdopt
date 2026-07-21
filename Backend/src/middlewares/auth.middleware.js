const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const authService = require("../services/auth.service")


async function protect(req , res , next){
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                message: "Not authorized , no token"
            })
        }
        
        const blacklistedToken = await authService.isTokenBlacklisted(token)

        if(blacklistedToken){
            return res.status(401).json({
                message:"Token not valid , token was logged out"
            })
        }

        const decodedToken = jwt.verify(token , process.env.JWT_SECRET);

        const user = await userModel.findById(decodedToken.id);

        if(!user){
            return res.status(401).json({
                message:"Not authorized, user no longer exists"
            })
        }

        req.user = user ; 
        next();

    } catch (error) {
        return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
}

module.exports = protect