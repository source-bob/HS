import '../css/login.css';
import { loginUser } from './auth';

const loginBlock = document.querySelector('#login-block');
const logUser = loginBlock.querySelector('#login-button');
logUser.addEventListener('click', loginUser);