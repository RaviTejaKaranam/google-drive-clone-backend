const express = require('express')
const router = express.Router()
//Controller
const {signUpController, accountActivation, loginController, forgotPasswordController, resetPasswordController} = require('../controllers/authController')
//Validator
const { runValidation } = require('../validators/validationResult')
const { userSignUpValidator, userLoginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/authValidator')

//Signup route
router.post('/signup', userSignUpValidator, runValidation, signUpController)
//Account activation route
router.post('/account-activation', accountActivation)
//Login Route
router.post('/login', userLoginValidator, runValidation, loginController)
//Forget-Reset Password
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPasswordController)
router.put('/reset-password', resetPasswordValidator, runValidation, resetPasswordController)


module.exports = router