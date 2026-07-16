const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database connected successfully: ${mongoose.connection.host}`);
        } catch (error) {
        console.error('Database connection failed:', error.message) 
        process.exit(1);       
     }
}

module.exports = connectDB;