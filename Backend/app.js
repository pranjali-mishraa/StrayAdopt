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
const conversationRouter = require('./src/routes/conversation.routes')

const ragSearchRouter = require("./src/routes/ragSearch.routes");
const ngoRouter = require("./src/routes/ngo.routes");

/* use all routes here */

  app.use('/api/auth',authRouter);
  app.use('/api/posts/',postRouter);
  app.use('/api/conversations',conversationRouter)
  
  app.use("/api", ragSearchRouter);
  app.use("/api/ngo", ngoRouter);
module.exports = app ;