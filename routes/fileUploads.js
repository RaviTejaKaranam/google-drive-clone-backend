const express = require("express");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const User = require("../models/userModel")
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.BUCKET_ARN,
});

console.log(process.env.AWS_ACCESS_KEY_ID)

const fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "ravidrivebucket",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 20000000 }, // In bytes: 2000000 bytes = 20 MB
}).single("file");

router.post("/file-upload", async (req, res) => {
  fileUpload(req, res, async (error) => {
    // console.log( 'requestOkokok', req.file );
    // console.log( 'error', error );
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.file === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        // If Success
        // console.log("request Body" , req.body)
        const { id } = (JSON.parse(JSON.stringify(req.body)))
        const fileName = req.file.key;
        const fileLocation = req.file.location; // Save the file name into database into profile model
        try{
          await User.findOneAndUpdate({_id : id}, {"$push" : {"files" : {file: fileName,
            location: fileLocation}}})
          }
          catch(error){
            return res.status(400).json({
              error : "Something went wrong"
            })
          }
            res.json({
              file : fileName,
              location : fileLocation
            });
        // console.log(fileLocation)
      }
    }
  });
});

module.exports = router