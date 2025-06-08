import promisePool from "../utils/database.js";
import 'dotenv/config';

const saveAlarmToDatabase = async (alarmData) => {
  try {
    const doc = await getDoc(alarmData.user_id);

    const sql = `INSERT INTO alarms (res_id, pat_id, doc_id, pat_check, doc_check)
                VALUES (?, ?, ?, ?, ?)`
    const params = [alarmData.res_id, alarmData.user_id, doc, alarmData.pat_check, false];
    const [result] = await promisePool.query(sql, params);
    return result;
  } catch (e) {
    console.error('error:', e);
  }
};

const getDoc = async (userID) => {
  try {
    const sql = `SELECT doc FROM patients
                WHERE id = ?`;
    const params = [userID];

    const [result] = await promisePool.query(sql, params);

    return result;
  } catch (e) {
    console.error('error:', e);
  }
};

const checkAlarmsFromServ = async (docID) => {
  try {
    console.log('CHECKING ALARMS STEP 99:', docID);
    const sql = `
    SELECT * FROM alarms
    WHERE doc_id = ? AND pat_check = ? AND doc_check = ?`;
    const params = [docID, 0, 0];

    const [result] = await promisePool.query(sql, params);
    console.log('RESULT OF CHECKING:', result);
    return result;
  } catch (e) {
    console.error('error:', e);
    throw e;
  }
};

const switchChecked = async (resID) => {
  try {
    const sql = `
    UPDATE alarms
    SET doc_check = ?
    WHERE res_id = ?`;
    const params = [1, resID];
    const [result] = await promisePool.query(sql, params);
    return result;
  } catch (e) {
    console.error('error:', e);
    throw e;
  }
};

export { saveAlarmToDatabase, checkAlarmsFromServ, switchChecked };
