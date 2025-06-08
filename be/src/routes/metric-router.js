import express from 'express';

import { authenticateToken } from '../middlewares/authentication.js';
import { saveMetric, importMetrics } from '../controllers/metric-controller.js';

const metricRouter = express.Router();

metricRouter.route('/:id')
  .get(authenticateToken, importMetrics)
  .post(authenticateToken, saveMetric);

export default metricRouter;
