import HRVState from './hrvState.js';
import { fetchData } from './fetch.js';
import { createMod } from './mods.js';
import { selectBlock } from './mech.js';

let lastAIRequestTimestamp = 0;
let lastSaveTimestamp = 0;
const SAVE_INTERVAL_MS = 60 * 1000; // 1 час
const AI_REQUEST_COOLDOWN_MS = 60 * 60 * 1000; // 10 минут

async function monitorHRVStatus() {
    setInterval(async () => {
        const currentStatus = HRVState.getHRVStatus();
        const currentMetrics = HRVState.getRRMetrics();
        const currentHeartRate = HRVState.getHeartRate();

        if (!currentStatus || !currentMetrics) {
            console.warn('Нет данных для анализа HRV.');
            return;
        }

        const now = Date.now();
        const userId = parseInt(localStorage.getItem('user_id'));
        const userAge = localStorage.getItem('pat_age');

        if (now - lastAIRequestTimestamp >= AI_REQUEST_COOLDOWN_MS && currentStatus !== 'Normaali') {
            console.log('SENDING METRICS TO AI, STEP 1');
            lastAIRequestTimestamp = now;
            await sendMetricsToAI(currentMetrics, userId, userAge);
            
        } else {
            console.log('AI Cooldown');
        }

        if (now - lastSaveTimestamp >= SAVE_INTERVAL_MS) {
            lastSaveTimestamp = now;
            await saveMetricsToDatabase(userId, currentMetrics, currentHeartRate, currentStatus);
            
        }

        
    }, 5000); // проверяем каждые 5 секунд
};

async function saveMetricsToDatabase(userId, metrics, hr, hrv) {
    // Здесь заглушка вместо реальной базы
    console.log('💾 Сохраняем метрики в базу данных:', metrics);
    metrics.hr = hr;
    metrics.hrv = hrv;

    const url = `http://localhost:3000/api/metrics/${userId}/`;
    const options = {
        body: JSON.stringify(metrics),
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-type': 'application/json',
        },
    };

    await fetchData(url, options);
    // TODO: Здесь можно подключить IndexedDB или API сервера
};

async function sendMetricsToAI(metrics, userID, age) {

    try {
        const url = 'http://localhost:3000/api/ai';
        const options = {
            body: JSON.stringify({
                user_id: userID,
                metrics: metrics,
                user_age: age,
                hr: HRVState.getHeartRate(),
                date: Date.now(),
            }),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
        };

        const userData = await fetchData(url, options);

        console.log('🧠 Ответ ИИ:', userData);

        
        
        await handleAiResponse(userData, userID);

        // TODO: Обработать ответ ИИ позже
    } catch (error) {
        console.error('Ошибка при отправке метрик ИИ:', error);
    }
};

async function handleAiResponse(data, userId) {
    const mainContent = data.content;
    
    try {
        await rebuildAiText(mainContent.patient_instruction);

        if (mainContent.status === 'critical') {
            await alarm(mainContent, userId);
        } else if (mainContent.status === 'warning') {
            await warning(mainContent, userId);
        } else {}
    } catch (e) {
        console.error('error:', e);
    }
};

async function warning(data, userID) {
    const modWindow = await selectBlock('main-dialog');
    modWindow.close();
    ahtung(data.inserted_id, userID, true);
    return true;
};

async function alarm(data, userId) {
    createMod(6);
    const modWindow = document.querySelector('#main-dialog');
    let timeLeft = 60;
    const button = document.getElementById('alarm-dia-button');

    const timerInterval = setInterval(() => {
        timeLeft--;
        button.textContent = `Olen kunnossa (${timeLeft})`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            modWindow.close();
            ahtung(data.inserted_id, userId, false); // если время истекло и не нажали
        }
    }, 1000);

    button.addEventListener('click', () => {
        clearInterval(timerInterval);
        ahtung(data.inserted_id, userId, true);
        modWindow.close(); // пользователь нажал кнопку — отменяем тревогу
    });

};

async function rebuildAiText(textData) {
    const aiUserBlock = document.querySelector('#patient-ai-text');

    aiUserBlock.textContent = textData;
};

async function ahtung(insertedID, userID, answered) {
    try {
        const url = 'http://localhost:3000/api/emergency/';
        const options = {
            body: JSON.stringify({
                res_id: insertedID,
                user_id: userID,
                pat_check: answered,
                date: Date.now(),
            }),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
        };

        const userData = await fetchData(url, options);
        if (userData) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error('mistake "ahtung!"', e);
    }
};

async function getMetric(patID) {
    try {
        const url = `http://localhost:3000/api/metrics/${patID}`;
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-type': 'application/json'
            },
        };

        const metric = await fetchData(url, options);
        return metric;
    } catch (e) {
        console.error('mistake getting metric', e);
    }
};


export { ahtung, monitorHRVStatus, rebuildAiText, getMetric };
