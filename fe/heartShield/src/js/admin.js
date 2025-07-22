import '../css/admin.css';
import { fillUserData, getUsers } from './users.js';
import { logout } from './auth.js';
import { createShadowBlock } from './mech.js';

const mainLogoutButton = document.querySelector('#logout');
mainLogoutButton.addEventListener('click', logout);


getUsers();
fillUserData();
createShadowBlock();