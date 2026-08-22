require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/socket');
const express = require("express")
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

app.use(express.static("public"))

connectDB().then(() => {
    initSocket(server);
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
