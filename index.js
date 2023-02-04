import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"
import AuthRoute from "./Routes/Auth.js"
import userRoute from "./Routes/userRoute.js"
import PostRoute from "./Routes/PostRoute.js"
import UploadRoute from "./Routes/uploadRoute.js"
import chatRoute from "./Routes/chatRoute.js"
import messageRoute from "./Routes/messageRoute.js"
import adminRoute from "./Routes/adminRoute.js"


//Routes
const app = express();

//to serve images for public
app.use(express.static("public"))
app.use('/images',express.static("images"))

//middlewares
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors())

dotenv.config();

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`listening to port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });


  //usage of routes
  

  app.use('/auth',AuthRoute)
  app.use('/user',userRoute)
  app.use('/post',PostRoute)
  app.use("/upload",UploadRoute)
  app.use('/chat',chatRoute)
  app.use("/message",messageRoute)

 


  //admin side routes

  app.use('/admin',adminRoute)

  