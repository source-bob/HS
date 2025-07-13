import express from 'express';
import { body } from 'express-validator';
import { getMe, login } from '../controllers/auth-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import { validationErrorHandler } from '../middlewares/error-handler.js';

const authRouter = express.Router();

// post to /api/auth/login
authRouter.post(
  '/login',
  body('email')
    .isEmail().withMessage('Wrong email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validationErrorHandler,
  login
);

authRouter.get('/me', authenticateToken, getMe);

export default authRouter;
