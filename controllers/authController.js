const User = require("../models/userModel");
/* https://stackoverflow.com/questions/31549857/mongoose-what-does-the-exec-function-do */
const { sendEmailWithNodemailer } = require("../helpers/email");
//https://www.npmjs.com/package/jsonwebtoken
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
//Signup controller
//Normal signup, email will not be sent to the user.
exports.signUpController = (req, res) => {
  const { name, email, password } = req.body;

  //Check if user already exists
  User.findOne({ email: email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is already taken",
      });
    } else {
      if (err) {
        return res.status(400).json({
          error: "Something went wrong Try again",
        });
      } else {
        //Generating a token
        const token = jwt.sign(
          { name, email, password }, //Payload
          process.env.JWT_ACCOUNT_ACTIVATION, //Secret key
          { expiresIn: "1d" }
        );

        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Activation Link",
          html: `
            <h3>Follow the below instructions to activate your account</h3>
            <p>Here is your account activation link</p>
            <p>${process.env.CLIENT_URL}/activate/${token}</p>
            `,
        };

        //Sending mail
        console.log("Sending the mail");
        sendEmailWithNodemailer(req, res, emailData);
      }
    }
  });
};
//Account activation

exports.accountActivation = (req, res) => {
  const { token } = req.body;
  console.log("printing token", token);
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      (err, decodedToken) => {
        if (err) {
          return res.status(401).json({
            error: "Token has expired, Please signup again",
          });
        }
      }
    );
    const { name, email, password } = jwt.decode(token);
    // console.log("printing name", name, email, password)
    //Check if user already exists in the database
    User.findOne({ email: email }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          error: "You have already signed up, Please signin",
        });
      }
    });
    //Save the user in the database
    const newUser = new User({ name, email, password });
    newUser.save((err, user) => {
      if (err) {
        return res.status(501).json({
          error: "Error in saving user to the database please signup again",
        });
      }
      return res.json({
        message: "Signup successful, Please login to your account",
      });
    });
  } else {
    res.status(400).json({
      error: "Token not available",
    });
  }
};
//Login controller
exports.loginController = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).exec((err, user) => {
    //If user has not signed up, but is trying to login.
    if (err || !user) {
      return res.status(400).json({
        error: "User does not exist, Please signup before logging in",
      });
    }
    //If user entered wrong password
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Username and password do not match",
      });
    }
    //Generate token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const { _id, name, email, role, files } = user;
    return res.json({
      token: token,
      user: { _id, name, email, role, files },
    });
  });
};

//forgot password controller
exports.forgotPasswordController = (req, res) => {
  const { email } = req.body;
  User.findOne({ email: email }).exec((err, user) => {
    //User not found
    if (err || !user) {
      return res.status(400).json({
        error: "User does not exist, Please sign up",
      });
    } else {
      //Generating a token
      const token = jwt.sign(
        { _id: user._id, name : user.name}, //Payload
        process.env.JWT_PASSWORD_RESET, //Secret key
        { expiresIn: "30m" }
      );

      user.updateOne({ resetPasswordLink: token }, (err, success) => {
        if (err) {
          return res.status(400).json({
            error: "Error updating the database",
          });
        } else {
          const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Reset Password Link",
            html: `
              <h3>Follow the below instructions to reset your password</h3>
              <p>Here is your password reset link</p>
              <p>${process.env.CLIENT_URL}/reset-password/${token}</p>
              `,
          };

          //Sending mail
          console.log("Sending the mail");
          sendEmailWithNodemailer(req, res, emailData);
        }
      });
    }
  });
};

//Reset Password
exports.resetPasswordController = (req, res) => {
  const { password, resetPasswordLink } = req.body;
  console.log(resetPasswordLink, password);
  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_PASSWORD_RESET,
      (err, decoded) => {
        if (err) {
          return res.status(400).json({
            error: "Something went wrong. Please try again",
          });
        } else {
          try {
            User.findOne({
              resetPasswordLink: resetPasswordLink,
            }).exec(
              (err, user) => {
                if (err || !user) {
                  return res.status(400).json({
                    error: "Something went wrong, try again with a new reset password link",
                  });
                } else {
                  const updatedFields = {
                    password: password,
                    resetPasswordLink: "",
                  };
                  User.findOne({ resetPasswordLink: resetPasswordLink }).exec(
                    (err, user) => {
                      if (err || !user) {
                        return res.status(400).json({
                          error: "User does not exist. Please sign up",
                        });
                      } else {
                        let { _id } = user;
                        _id = mongoose.Types.ObjectId(_id);
                        User.findById(_id, ((err, user)=>{
                          if(err){
                            return res.status(400).json({
                              error : "Something went wrong try again"
                            })
                          }
                          else{
                            user.password = password
                            console.log(password)
                            user.resetPasswordLink = ""
                            user.save((err, success)=>{
                              if(err){
                                return res.status(400).json({
                                  error : "Something went wrong try again"
                                })
                              }
                              else{
                                return res.json({
                                  'message' : "Password has been updated successfully!"
                                })
                              }
                            })
                            
                          }
                        }))
                    }
                  }
                  );
                }
              }
            );
          } catch (error) {
            return res.status(400).json({
              error: "Something went wrong. Try again",
            });
          }
        }
      }
    );
  }
};
