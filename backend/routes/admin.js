import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getUsers,
  toggleUserStatus,
  createFaculty,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getExams,
  createExam,
  getResults,
  publishResults,
  getActivityLogs,
  createNotification,
  getNotifications
} from '../controllers/adminController.js';
import { createExamValidation, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('administrator'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:userId/status', toggleUserStatus);
router.post('/users/faculty', createFaculty);
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:departmentId', updateDepartment);
router.delete('/departments/:departmentId', deleteDepartment);
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:subjectId', updateSubject);
router.delete('/subjects/:subjectId', deleteSubject);
router.get('/exams', getExams);
router.post('/exams', createExamValidation, handleValidationErrors, createExam);
router.get('/results', getResults);
router.post('/results/publish', publishResults);
router.get('/activity-logs', getActivityLogs);
router.post('/notifications', createNotification);
router.get('/notifications', getNotifications);

export default router;
