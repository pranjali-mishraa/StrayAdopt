require('dotenv').config();
const app = require('./app')
const connectDB = require('./src/config/database')

const PORT = process.env.PORT || 5000;

connectDB().then (()=>app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
}))