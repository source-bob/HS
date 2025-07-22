import '../css/doc.css';
import { getUsers, fillUserData } from './users.js';
import { alarmChecker } from './alarm.js'
import { logout } from './auth.js';
import { createShadowBlock } from './mech.js';

const mainLogoutButton = document.querySelector('#logout');
mainLogoutButton.addEventListener('click', logout);

getUsers();
fillUserData();
createShadowBlock();
//alarmChecker(localStorage.getItem('user_id'));
alarmChecker(localStorage.getItem('user_id'));

