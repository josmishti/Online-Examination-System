import express from 'express';
import { registerApplicant, login, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerApplicantValidation, loginValidation, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

router.post('/register', registerApplicantValidation, handleValidationErrors, registerApplicant);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/me', authenticate, getCurrentUser);

export default router;
