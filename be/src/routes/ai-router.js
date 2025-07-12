import express from 'express';

import { authenticateToken } from '../middlewares/authentication.js';
import { saveAIres, analyze, getAiRes, getFullAiRes } from '../controllers/ai-controller.js';

const aiRouter = express.Router();

aiRouter.route('/')
  //.get(authenticateToken, getLastRes)
  .post(authenticateToken, analyze);

aiRouter.route('/:id')
  .get(authenticateToken, getAiRes)
  .post(saveAIres);

aiRouter.route('/full/:id')
  .get(authenticateToken, getFullAiRes);

export default aiRouter;
