//https://express-validator.github.io/docs/validation-result-api.html#withdefaultsoptions
//This file is to display the validation errors if any

const { validationResult } = require('express-validator')

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    //422 cannot process request further due to errors
    return res.status(422).json({
      error : errors.array()[0].msg
    })
  }
  next() //Goes to the next middleware
}