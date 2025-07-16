import express from 'express';
import { body, param } from 'express-validator';
import { validationErrorHandler } from '../middlewares/error-handler.js';

import { authenticateToken } from '../middlewares/authentication.js';
import { saveMetric, importMetrics } from '../controllers/metric-controller.js';

const metricRouter = express.Router();

metricRouter.route('/:id')
  .get(
    authenticateToken,
    param('id').isInt().withMessage('Invalid ID'),
    validationErrorHandler,
    importMetrics
  )
  .post(
    authenticateToken,
    param('id').isInt().withMessage('Invalid ID'),
    body('sdnn').isNumeric().withMessage('sdnn must be a number'),
    body('rmssd').isNumeric().withMessage('rmssd must be a number'),
    body('pnn50').isNumeric().withMessage('pnn50 must be a number'),
    body('lf_hf').isNumeric().withMessage('lf_hf must be a number'),
    body('rr_mean').isNumeric().withMessage('rr_mean must be a number'),
    body('hr').isNumeric().withMessage('hr must be a number'),
    body('hrv').isString().isLength({ min: 3 }).withMessage('hrv must be a string'),
    validationErrorHandler,
    saveMetric
  );

export default metricRouter;
