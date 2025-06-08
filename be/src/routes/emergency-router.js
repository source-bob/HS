import express from 'express';
import { authenticateToken } from '../middlewares/authentication.js';
import { saveAlarm, checkAlarm, changeDocCheck } from '../controllers/emergency-controller.js';

const emergencyRouter = express.Router();

emergencyRouter.route('/')
  .post(authenticateToken, saveAlarm);

emergencyRouter.route('/:id')
  .get(authenticateToken, checkAlarm)
  .patch(authenticateToken, changeDocCheck);

export default emergencyRouter;
