require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

connectDB().then(() => {
    initSocket(server);
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
