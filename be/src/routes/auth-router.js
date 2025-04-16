import express from 'express';
import {getMe, login} from '../controllers/auth-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import { validationErrorHandler } from '../middlewares/error-handler.js';
import { body } from 'express-validator';

const authRouter = express.Router();

// post to /api/auth/login
authRouter.post('/login', login);
authRouter.get('/me', authenticateToken, getMe);

export default authRouter;
