const mongoose = require("mongoose");
const crypto = require("crypto");

//Setting a schema for the user
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, //datatype of the field name
      trim: true, // trim empty spaces at the brginning and ending
      required: true, //field is mandatory
      max: 28, //Max Length of the field
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true, //Accept only unique email ids
      lowercase: true,
    },
    //Storing the hashed password in the db not the plain text
    hashed_password: {
      type: String,
      required : true
    },
    //Salt value to hash passwords
    salt: String,
    role: {
      type: String,
      default: "user", //By default every account is an user account
    },
    files : {
      type : Array
    },
    //Generate a new token and store in the db if the user forgets the password
    //By default the new token is an empty string
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  //timestamps help us track the changes made in our model
  { timestamps: true }
);

//virtuals

userSchema
  .virtual("password")
  .set(function (password) {
    console.log("Hello" , password)
    this._password = password;
    this.salt = this.generateSalt(); // to generate salt
    this.hashed_password = this.encryptPassword(password); //password encryption
  })
  .get(function () {
    return this._password;
  });

//Methods

userSchema.methods = {
  encryptPassword: function (password) {
    //Setting the password type to string
    password = '' + password
    if (!password) {
      return "";
    }
    try {
      // sha1 is the algorithm and this.salt is the key
      //secure hash algorithm 1
      return (crypto
        .createHmac("sha1", this.salt) 
        .update(password)
        .digest("hex"));
    } catch (error) {
      return "";
    }
  },
  //Function to generate a random salt (Key)
  generateSalt : function(){
    return Math.round(new Date().valueOf() * Math.random()) + ''
  },
  //Compare the plain text password of the user to the hashed password
  authenticate : function(plainText){
    return this.encryptPassword(plainText) === this.hashed_password
  }
};

module.exports = mongoose.model('User', userSchema)
