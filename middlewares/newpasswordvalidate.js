const { body, validationResult } = require('express-validator');

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

const passvalidate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    const errorMessages = errors.array().map(error => error.msg);
    req.flash('error', errorMessages);
    return res.redirect('/createNewPassword');
  }
  next();
};

module.exports = {
  passwordValidation,
  confirmPasswordValidation,
  passvalidate,
};
