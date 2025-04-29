import '../css/patient.css';
import { fillPatientData, addEventListenersPatient } from './users';
import { debugMovesenseCharacteristics } from './debugBLE';
import HRVState from './hrvState.js';

window.debugMovesenseCharacteristics = debugMovesenseCharacteristics;

fillPatientData();
addEventListenersPatient();

const hrValue = document.querySelector('#patient-info-hr-value');
const hrvValue = document.querySelector('#patient-info-hrv-value');

// 📢 Подписка на изменения HRVState
HRVState.subscribe((state) => {
    hrValue.textContent = state.heartRate ? `${state.heartRate} bpm` : '-';
    hrvValue.textContent = state.hrvStatus || '-';
});

// Потом уже остальной код: подключение к устройству, кнопки и т.д.

//addEventListenersPatient();