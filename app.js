const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//Importing Routes
const authRouter = require("./routes/auth");
const fildUploadRouter = require("./routes/fileUploads");
//App Middleware

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
dotenv.config({
  path: "./config/.env",
});

//Connect to the database

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.mongodbUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true, //To avoid deprecation warnings
    });
    console.log(`Mongodb connected`);
  } catch (error) {
    console.log(error);
  }
};

connectDB();
//Middleware
app.use("/", authRouter);
app.use("/", fildUploadRouter);
//Setting port number
const port = process.env.PORT || 3010;

app.listen(port, () => {
  console.log(`The server is up and running on ${port}`);
});
