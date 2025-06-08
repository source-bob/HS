import { saveMetricToDatabase, getLastMeasures } from '../models/metric-model.js';

const saveMetric = async (req, res, next) => {
  try {
    const patID = req.params.id;
    await saveMetricToDatabase(patID, req.body);
    res.status(201).json({message: 'metrics added.'});
  } catch (e) {
    next(e);
  }
};

const importMetrics = async (req, res, next) => {
  try {
    const patID = req.params.id;
    const metrics = await getLastMeasures(patID, 100);
    res.status(200).json(metrics);
  } catch (e) {
    next(e);
  }
};

export { saveMetric, importMetrics };
