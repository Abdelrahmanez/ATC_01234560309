const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require('../../models/userModel');



exports.signupValidator = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),

  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error('Email already in use');
      }
      return true;
    }),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  check('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),

  validatorMiddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  validatorMiddleware,
];
