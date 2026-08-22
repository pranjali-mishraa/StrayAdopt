require('dotenv').config();

const http = require('http');
const path = require('path');
const express = require('express');

const app = require('./app');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Serve React frontend
app.use(express.static(path.join(__dirname, 'public')));

// React Router fallback
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

connectDB().then(() => {
    initSocket(server);

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});