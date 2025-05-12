const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.createEventValidator = [
  check('name')
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ min: 3 })
    .withMessage('Event name must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Event name must be less than 100 characters')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('description')
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 20 })
    .withMessage('Event description must be at least 20 characters')
    .isLength({ max: 2000 })
    .withMessage('Event description is too long'),

  check('category')
    .notEmpty()
    .withMessage('Event category is required')
    .isString()
    .withMessage('Category must be a string'),

  check('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((val) => {
      if (new Date(val) < new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  check('venue')
    .notEmpty()
    .withMessage('Event venue is required')
    .isString()
    .withMessage('Venue must be a string'),

  check('price')
    .notEmpty()
    .withMessage('Event price is required')
    .isNumeric()
    .withMessage('Event price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),

  check('image')
    .notEmpty()
    .withMessage('Event image is required')
    .isString()
    .withMessage('Image must be a string (URL or path)'),

  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings')
    .custom((tags) => {
      if (!tags.every((tag) => typeof tag === 'string')) {
        throw new Error('Each tag must be a string');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.getEventValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];

exports.updateEventValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Event name must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Event name must be less than 100 characters')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('description')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Event description must be at least 20 characters')
    .isLength({ max: 2000 })
    .withMessage('Event description is too long'),

  check('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),

  check('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((val) => {
      if (new Date(val) < new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  check('venue')
    .optional()
    .isString()
    .withMessage('Venue must be a string'),

  check('price')
    .optional()
    .isNumeric()
    .withMessage('Event price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),

  check('image')
    .optional()
    .isString()
    .withMessage('Image must be a string (URL or path)'),

  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings')
    .custom((tags) => {
      if (!tags.every((tag) => typeof tag === 'string')) {
        throw new Error('Each tag must be a string');
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteEventValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validatorMiddleware,
];