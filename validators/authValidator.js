// express-validator is a package that helps us to validate req body 
//To get custom error messages
//https://express-validator.github.io/docs/custom-error-messages.html
const { check } = require('express-validator')

exports.userSignUpValidator = [
  check('name')
  .not()
  .isEmpty()
  .withMessage('Name is required'),
  check('email')
  .isEmail()
  .withMessage('Must be a valid email address'),
  check('password')
  .isLength({
    min : 6
  })
  .withMessage('Password must have atleast 6 characters')
]

exports.userLoginValidator = [
  check('email')
  .isEmail()
  .withMessage('Must be a valid email address'),
  check('password')
  .isLength({
    min : 6
  })
  .withMessage('Password must have atleast 6 characters')
]

exports.forgotPasswordValidator = [
  check('email')
  .isEmail()
  .withMessage('Must be a valid email address')
]

exports.resetPasswordValidator = [
  check('password')
  .not()
  .isEmpty()
  .isLength({min : 6})
  .withMessage('Password must have atleast 6 characters')
]