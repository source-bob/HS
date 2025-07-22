import {
  getPatientAlarms,
  savePatientAlarm,
  saveAlarmToDatabase,
  checkAlarmsFromServ,
  switchChecked,
  switchCheckedMsg
} from "../models/emergency-model.js";

const saveAlarm = async (req, res, next) => {
  try {
    await saveAlarmToDatabase(req.body);
    res.status(201).json({message: 'notifies started'});
  } catch (e) {
    next(e);
    return;
  }
};

const getAlarmMsgs = async (req, res, next) => {
  try {
    const data = await getPatientAlarms(req.params.id);
    res.status(200).json(data);
    return;
  } catch (e) {
    next(e);
    return;
  }
};

const savePatAlarm = async (req, res, next) => {
  try {
    const userData = req.body;
    userData.pat_id = parseInt(req.params.id);
    await savePatientAlarm(userData);
    res.status(201).json({message: 'pat ilmoitus saved'});
  } catch (e) {
    next(e);
    return;
  }
};

const checkAlarm = async (req, res, next) => {
  try {
    console.log('CHECKING ALARMS ON SERV', req.params.id);
    const check = await checkAlarmsFromServ(req.params.id);
    console.log('CHECJ:', check);
    res.status(200).json({ check });
  } catch (e) {
    next(e);
    return;
  }
};

const changeDocCheck = async (req, res, next) => {
  try {
    const data = await switchChecked(req.params.id);
    res.status(200).json({ data });
  } catch (e) {
    next(e);
    return;
  }
};

const changeDocCheckMsg = async (req, res, next) => {
  try {
    const data = await switchCheckedMsg(req.params.id);
    res.status(200).json({ data });
  } catch (e) {
    next(e);
    return;
  }
};

export { changeDocCheckMsg, getAlarmMsgs, savePatAlarm, saveAlarm, checkAlarm, changeDocCheck };
