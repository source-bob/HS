import { saveAiResponseToDatabase, makeResearch, getPatAiRes, fullAiRes } from '../models/ai-model.js';

const analyze = async (req, res, next) => {
  try {
    console.log('SEND METRICS TO AI, STEP 2.', req.body);
    const predict = await makeResearch(req.body);
    res.status(201).json({message: 'predicted', content: predict});
  } catch (e) {
    next(e);
    return;
  }
};

const saveAIres = async (req, res, next) => {
  try {
    const userID = req.params.id;
    const response = await saveAiResponseToDatabase(userID, req.body);
    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

const getAiRes = async (req, res, next) => {
  try {
    const response = await getPatAiRes(req.params.id);
    res.status(200).json({
      data: response,
    });
  } catch (e) {
    next(e);
  }
};

const getFullAiRes = async (req, res, next) => {
  try {
    const response = await fullAiRes(req.params.id);
    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

export { saveAIres, analyze, getAiRes, getFullAiRes };
