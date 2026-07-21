const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model")

async function protect(req , res , next){
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                message: "Not authorized , no token"
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