const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express();


app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(express.json());
app.use(cookieParser())


/* require all routes here */
const authRouter = require('./src/routes/auth.routes');
const postRouter = require('./src/routes/post.routes');


/* use all routes here */
app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth',authRouter);
  app.use('/api/posts/',postRouter);

module.exports = app ;