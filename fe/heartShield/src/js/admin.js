import '../css/admin.css';
import { fillUserData, getUsers } from './users.js';
import { logout } from './auth.js';

const mainLogoutButton = document.querySelector('#logout');
mainLogoutButton.addEventListener('click', logout);


getUsers();
fillUserData();