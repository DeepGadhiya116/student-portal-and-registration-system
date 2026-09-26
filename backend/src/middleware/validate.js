import { body, validationResult } from 'express-validator';

// Generic error response formatter
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Form validation failed. Please check the provided inputs.',
      errors: formattedErrors,
    });
  }
  next();
};

// Registration form validation rules
export const validateRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters long.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address (e.g. student@university.edu)')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.'),

  body('studentId')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters.'),

  body('department')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage('Department name must be valid.'),

  body('year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Academic Year must be between 1 and 4.'),

  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8.'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9()]{7,18}$/)
    .withMessage('Please provide a valid contact phone number.'),

  handleValidationErrors,
];

// Login form validation rules
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email format.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty.'),

  handleValidationErrors,
];

// Profile update validation rules (PUT method)
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters long.'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9()]{7,18}$/)
    .withMessage('Please enter a valid phone number (7-18 digits and characters).'),

  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty.'),

  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be a valid number between 1 and 8.'),

  body('year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4.'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters.'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters.'),

  body('emergencyContact')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact cannot exceed 100 characters.'),

  handleValidationErrors,
];

// Password change validation rules (PUT method)
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long.')
    .matches(/\d/)
    .withMessage('New password must include at least one number.'),

  handleValidationErrors,
];

// Course creation & update validation rules
export const validateCourse = [
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required.')
    .isLength({ min: 3, max: 10 })
    .withMessage('Course code must be between 3 and 10 characters.'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required.')
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters.'),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required.'),

  body('credits')
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be an integer between 1 and 6.'),

  body('capacity')
    .isInt({ min: 1, max: 500 })
    .withMessage('Capacity must be at least 1 student.'),

  body('instructor')
    .trim()
    .notEmpty()
    .withMessage('Instructor name is required.'),

  handleValidationErrors,
];

// Announcement validation rules
export const validateAnnouncement = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Announcement title is required.')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters.'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Announcement content is required.')
    .isLength({ min: 5 })
    .withMessage('Content must be at least 5 characters.'),

  body('category')
    .optional()
    .isIn(['Academic', 'Examination', 'Event', 'Urgent', 'General'])
    .withMessage('Invalid announcement category.'),

  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Invalid priority level.'),

  handleValidationErrors,
];
