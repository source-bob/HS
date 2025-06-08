import { saveAlarmToDatabase, checkAlarmsFromServ, switchChecked } from "../models/emergency-model.js";

const saveAlarm = async (req, res, next) => {
  try {
    await saveAlarmToDatabase(req.body);
    res.status(201).json({message: 'notifies started'});
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

export { saveAlarm, checkAlarm, changeDocCheck };
