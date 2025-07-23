import promisePool from "../utils/database.js";
import 'dotenv/config';

const saveMetricToDatabase = async (userId, userData) => {
  const { sdnn, rmssd, pnn50, lf_hf, rr_mean, hr, hrv } = userData;
  const sql = `INSERT INTO metrics (pat_id, lf_hf, sdnn, rmssd, pnn50, hr, rr_mean, hrv_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [userId , lf_hf, sdnn, rmssd, pnn50, hr, rr_mean, hrv];

  console.log('USER DATA FOR SAVING:', userId, userData)

  try {
    const [result] = await promisePool.query(sql, params);
    return { metric_id: result.insertId };
  } catch (e) {
    console.error(e);
    throw new Error('database error');
  }
};

const getLastMeasures = async (patId, amount) => {
  try {
    const sql = `SELECT * FROM metrics
                WHERE pat_id = ?
                ORDER BY metric_date DESC
                LIMIT ?`;
    const [patData] = await promisePool.query(sql, [patId, amount]);
    console.log(patData);
    return patData;
  } catch (e) {
    console.error('error:', e);
  }
};

/* const testFunc = async () => {
  const patMes = await getLastMeasures(6, 1);
  const measures = patMes[0];
  const check = Object.values(measures);
  const keyCheck = Object.keys(measures);
  for (let value of check) {
    console.log(typeof(value));
  }
  console.log(keyCheck);
};

testFunc(); */



export { saveMetricToDatabase, getLastMeasures };
