import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { validate, authenticate, authLimiter } from '../middlewares/index.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validations/auth.validation.js';

const router = Router();

// Public Authentication Routes (with strict brute-force protection rate limiter)
router.post('/register', authLimiter, validate(registerSchema, 'body'), register);
router.post('/login', authLimiter, validate(loginSchema, 'body'), login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

// Protected Routes (Require Valid JWT Access Token)
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, validate(updateProfileSchema, 'body'), updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema, 'body'), changePassword);

export default router;
