const { body, validationResult } = require('express-validator');

const userSignupValidation = [
  body('Username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 4 }).withMessage('Username must be at least 4 characters'),

  body('Password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.Password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('Email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
    .withMessage('Invalid email format')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash('error', errorMessages);
    return res.redirect('/signup');
  }
  next();
};


const passwordValidation = [
  body('Password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const confirmPasswordValidation = [
  body('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.Password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

module.exports = {
  userSignupValidation,
  validate,
  passwordValidation,
  confirmPasswordValidation,
};
