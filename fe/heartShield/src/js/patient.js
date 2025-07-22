import '../css/patient.css';
import { fillPatientData, addEventListenersPatient } from './users';
import { debugMovesenseCharacteristics } from './debugBLE';
import HRVState from './hrvState.js';
import { createShadowBlock } from './mech.js';
import { savePos } from './geo.js';
import { logout } from './auth.js';

const mainLogoutButton = document.querySelector('#logout');
mainLogoutButton.addEventListener('click', logout);

window.debugMovesenseCharacteristics = debugMovesenseCharacteristics;

fillPatientData();
addEventListenersPatient();
savePos();
createShadowBlock();

const hrValue = document.querySelector('#patient-info-hr-value');
const hrvValue = document.querySelector('#patient-info-hrv-value');

// 📢 Подписка на изменения HRVState
HRVState.subscribe((state) => {
    hrValue.textContent = state.heartRate ? `${state.heartRate} bpm` : '-';
    hrvValue.textContent = state.hrvStatus || '-';
});

// Потом уже остальной код: подключение к устройству, кнопки и т.д.

//addEventListenersPatient();