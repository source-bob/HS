import express from 'express';
import { body, param } from 'express-validator';
import { validationErrorHandler } from '../middlewares/error-handler.js';
import { authenticateToken } from '../middlewares/authentication.js';
import { saveAlarm, checkAlarm, changeDocCheck } from '../controllers/emergency-controller.js';

const emergencyRouter = express.Router();

emergencyRouter.route('/')
  .post(
    authenticateToken,

    body('res_id')
      .isInt()
      .withMessage('res_id must be an integer'),

    body('user_id')
      .isInt()
      .withMessage('user_id must be an integer'),

    body('pat_check')
      .isBoolean()
      .withMessage('pat_check must be true or false'),

    body('date')
      .isNumeric()
      .withMessage('date must be a timestamp'),

    validationErrorHandler,
    saveAlarm
  );

emergencyRouter.route('/:id')
  .get(
    authenticateToken,

    param('id')
      .isInt()
      .withMessage('Invalid ID'),

    validationErrorHandler,
    checkAlarm
  )
  .patch(
    authenticateToken,

    param('id')
      .isInt()
      .withMessage('Invalid ID'),

    validationErrorHandler,
    changeDocCheck
  );

export default emergencyRouter;
