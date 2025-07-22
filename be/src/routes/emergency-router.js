import express from 'express';
import { body, param } from 'express-validator';
import { validationErrorHandler } from '../middlewares/error-handler.js';
import { authenticateToken } from '../middlewares/authentication.js';
import {
  getAlarmMsgs,
  savePatAlarm,
  saveAlarm,
  checkAlarm,
  changeDocCheck,
  changeDocCheckMsg
} from '../controllers/emergency-controller.js';

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
  .post(
    authenticateToken,
    param('id')
      .isInt()
      .withMessage('Invalid ID'),
    body('symptoms')
      .trim()
      .isString()
      .isLength({min: 4, max: 120})
      .withMessage('symptoms must be a string'),
    body('pat_msg')
      .trim()
      .isString()
      .isLength({min: 4, max: 150})
      .withMessage('pat_msg must be a string'),
    validationErrorHandler,
    savePatAlarm
  )
  .patch(
    authenticateToken,

    param('id')
      .isInt()
      .withMessage('Invalid ID'),

    validationErrorHandler,
    changeDocCheck
  );

emergencyRouter.route('/msg/:id')
  .get(
    authenticateToken,
    param('id')
      .isInt()
      .withMessage('ID must be an integer'),
    validationErrorHandler,
    getAlarmMsgs
  )
  .patch(
    authenticateToken,

    param('id')
      .isInt()
      .withMessage('Invalid ID'),

    validationErrorHandler,
    changeDocCheckMsg
  );

export default emergencyRouter;
