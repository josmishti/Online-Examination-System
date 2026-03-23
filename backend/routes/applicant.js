import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getExams,
  startExam,
  getExamQuestions,
  saveAnswer,
  submitExam,
  incrementTabSwitch,
  getResults,
  getResultDetails,
  updateProfile,
  getNotifications
} from '../controllers/applicantController.js';

const router = express.Router();

// All routes require authentication and applicant role
router.use(authenticate);
router.use(authorize('applicant'));

router.get('/dashboard', getDashboard);
router.get('/exams', getExams);
router.post('/exams/:examId/start', startExam);
router.get('/attempts/:attemptId/questions', getExamQuestions);
router.post('/attempts/:attemptId/answers', saveAnswer);
router.post('/attempts/:attemptId/submit', submitExam);
router.post('/attempts/:attemptId/tab-switch', incrementTabSwitch);
router.get('/results', getResults);
router.get('/results/:attemptId', getResultDetails);
router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);

export default router;
