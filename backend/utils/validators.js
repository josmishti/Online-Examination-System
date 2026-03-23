import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerApplicantValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('marks_12th').isFloat({ min: 0, max: 100 }).withMessage('12th marks must be between 0 and 100'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createQuestionValidation = [
  body('subject_id').isInt().withMessage('Subject ID is required'),
  body('question_text').notEmpty().withMessage('Question text is required'),
  body('option_a').notEmpty().withMessage('Option A is required'),
  body('option_b').notEmpty().withMessage('Option B is required'),
  body('option_c').notEmpty().withMessage('Option C is required'),
  body('option_d').notEmpty().withMessage('Option D is required'),
  body('correct_option').isIn(['A', 'B', 'C', 'D']).withMessage('Correct option must be A, B, C, or D'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  body('marks').isInt({ min: 1 }).withMessage('Marks must be a positive integer'),
];

export const createExamValidation = [
  body('exam_name').notEmpty().withMessage('Exam name is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('start_time').isISO8601().withMessage('Start time must be a valid date'),
  body('end_time').isISO8601().withMessage('End time must be a valid date'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
];
