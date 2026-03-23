import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getSubjects,
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  getProfile
} from '../controllers/facultyController.js';
import { createQuestionValidation, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication and faculty role
router.use(authenticate);
router.use(authorize('faculty'));

router.get('/dashboard', getDashboard);
router.get('/subjects', getSubjects);
router.post('/questions', createQuestionValidation, handleValidationErrors, createQuestion);
router.get('/questions', getQuestions);
router.put('/questions/:questionId', createQuestionValidation, handleValidationErrors, updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);
router.get('/profile', getProfile);

export default router;
