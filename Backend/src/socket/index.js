const {server, Socket} = require("socket.io")
const jwt = require("jsonwebtoken")
const cookie = require("cookie")
const userModel = require("../models/user.model")

let io ;

function initSocket(server){
    io = new Server (server , {
        cors: {
            origin : "http://localhost:5173",
            credentials : true 
        }
    });


    io.use(async (socket , next)=>{
        try {

            const rawCookie = socket.handshake.headers.cookie
            if(!rawCookie){
                return next(new Error ("Not authorized, no token"));
            }

            const parsedCookie = cookie.parse(rawCookie)
            const token = parsedCookie.token 

            if (!token) {
                return next(new Error("Not authorized, no token"));
            }

            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            const user = userModel.findById(decoded.id);

            if(!user){
                return next(new Error("Not authorized, user no longer exists"));
            }

            socket.user = user ;
            next();


        } catch (error) {
            next(new Error("Not authorized, invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.user.username} (${socket.id})`);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.user.username}`);
        });
    });
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}

module.exports = { initSocket, getIO };