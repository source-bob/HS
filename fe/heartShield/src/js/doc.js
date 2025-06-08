import '../css/doc.css';
import { getUsers, fillUserData } from './users.js';
import { alarmChecker } from './alarm.js'
import { createMod } from './mods.js';

getUsers();
fillUserData();
//alarmChecker(localStorage.getItem('user_id'));
alarmChecker(localStorage.getItem('user_id'));

