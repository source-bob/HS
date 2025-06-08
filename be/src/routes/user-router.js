import express from 'express';

import { getUsers, getPatients, getUserByStatusAndId } from '../controllers/user-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';

const userRouter = express.Router();

userRouter.route('/')
    .get(authenticateToken, getUsers);

userRouter.route('/:id')
    .get(authenticateToken, getPatients);

userRouter.route('/:status/:id')
    .get(authenticateToken, getUserByStatusAndId);

export default userRouter;
