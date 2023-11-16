const { body, validationResult } = require('express-validator');

const userSignupValidation = [
  body('Username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 4 }).withMessage('Username must be at least 4 characters')
    .bail(),

  body('Password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .bail(),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.Password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .bail(),

  body('Email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .bail(),
];



const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array()); // Log the errors to see what is being captured
    const errorMessages = errors.array().map(error => error.msg);
    req.flash('error', errorMessages);
    return res.redirect('/signup');
  }
  next();
};




module.exports = {
  userSignupValidation,
  validate,
};
