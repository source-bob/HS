import express from 'express';
import { body, param } from 'express-validator';
import { validationErrorHandler } from '../middlewares/error-handler.js';

import { authenticateToken } from '../middlewares/authentication.js';
import { saveAIres, analyze, getAiRes, getFullAiRes } from '../controllers/ai-controller.js';

const aiRouter = express.Router();

aiRouter.route('/')
  .post(
    authenticateToken,
    body('user_id')
      .isInt()
      .withMessage('user_id must be an integer'),
    body('metrics')
      .isArray({ min: 300, max: 300 }).withMessage('metrics must be an array of 300 values')
      .custom((arr) => arr.every(v => typeof v === 'number' && v > 0))
      .withMessage('metrics array must contain only positive numbers'),
    body('user_age')
      .isInt({ min: 1, max: 500 })
      .withMessage('user_age must be a valid age'),
    body('hr')
      .isInt({ min: 0, max: 250 })
      .withMessage('hr must be a realistic heart rate'),
    body('date')
      .isNumeric()
      .withMessage('date must be a timestamp'),
    validationErrorHandler,
    analyze
  );

aiRouter.route('/:id')
  .get(
    authenticateToken,
    param('id').isInt().withMessage('id must be an integer'),
    validationErrorHandler,
    getAiRes
  )
  .post(
    authenticateToken,
    param('id')
      .isInt().withMessage('id must be an integer'),

    body('status')
      .isString()
      .trim()
      .isLength({ min: 1, max: 10 })
      .withMessage('status must be a non-empty string'),

    body('patient_instruction')
      .isString()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('patient_instruction must be a string'),

    body('doctor_note')
      .isString()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('doctor_note must be a string'),

    validationErrorHandler,
    saveAIres
  );

aiRouter.route('/full/:id')
  .get(
    authenticateToken,
    param('id').isInt().withMessage('id must be an integer'),
    validationErrorHandler,
    getFullAiRes
  );

export default aiRouter;
