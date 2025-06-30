import express from 'express';

import {
  getUsers,
  getPatients,
  getUserByStatusAndId,
  newUser,
  patientData,
  deleteUser
} from '../controllers/user-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';

const userRouter = express.Router();

userRouter.route('/')
    .get(authenticateToken, getUsers)
    .post(authenticateToken, newUser);

userRouter.route('/:id')
    .get(authenticateToken, getPatients)
    .post(authenticateToken, patientData)
    .delete(authenticateToken, deleteUser);

userRouter.route('/:status/:id')
    .get(authenticateToken, getUserByStatusAndId);

export default userRouter;
