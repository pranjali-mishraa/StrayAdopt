require('dotenv').config();
const http = require('http')
const app = require('./app')
const connectDB = require('./src/config/database')
const {initSocket}= require("./src/socket/index.js")

const PORT = process.env.PORT || 5000;

connectDB().then (()=>app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
}))