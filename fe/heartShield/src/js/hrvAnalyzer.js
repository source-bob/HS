import HRVState from './hrvState.js';
import { fetchData } from './fetch.js';
import { createMod } from './mods.js';
import { createButton, selectBlock, createShadow, showMessageModal } from './mech.js';
import { callEmergency } from './alarm.js';

let lastAIRequestTimestamp = 0;
let lastSaveTimestamp = 0;
const SAVE_INTERVAL_MS = 60 * 1000; // 1 min
const AI_REQUEST_COOLDOWN_MS = 10 * 60 * 1000; // 10 min

async function monitorHRVStatus() {
    setInterval(async () => {
        const currentStatus = HRVState.getHRVStatus();
        const currentMetrics = HRVState.getRRMetrics();
        const currentHeartRate = HRVState.getHeartRate();

        if (!currentStatus || !currentMetrics) {
            console.warn('No data for check');
            return;
        }

        const now = Date.now();
        const userId = parseInt(localStorage.getItem('user_id'));
        const userAge = localStorage.getItem('pat_age');

        if (now - lastAIRequestTimestamp >= AI_REQUEST_COOLDOWN_MS && currentStatus !== 'Normaali') {
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

    const url = `https://hesh.northeurope.cloudapp.azure.com/api/metrics/${userId}/`;
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
        const url = 'https://hesh.northeurope.cloudapp.azure.com/api/ai';
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

        console.log('🧠 AI response:', userData);

        
        
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
            await ahtung(mainContent.inserted_id, userId, true);
        } else {}
    } catch (e) {
        console.error('error:', e);
    }
};

/*const testData = {
    content: {
        inserted_id: 1,
        status: 'critical',
        patient_instruction: 'Continue monitoring and maintain normal activities. Contact a doctor if you experience chest pain or shortness of breath.',
        result_doc_text: 'HRV parameters (SDNN, RMSSD, pNN50) are within normal ranges. Balanced LF/HF ratio suggests stable autonomic activity. No immediate signs of acute cardiac risk based on current data.',
        answered: 'false'
    }
};

const alarmTests = async () => {
    await handleAiResponse(testData, 6);
    return;
};

alarmTests();
*/

async function alarm(data, userId) {
    createMod(6);
    async function butListener() {
        clearInterval(timerInterval);
        ahtung(data.inserted_id, userId, true);
        await createShadow(2);
        modWindow.close();
    };

    const alarmButton = await createButton('alarm-dia-button-pat', 'dia-control-button', '⚠️ Olen kunnossa', butListener);
    const modBody = await selectBlock('dia-body');
    const modWindow = document.querySelector('#main-dialog');

    modBody.appendChild(alarmButton);
    let timeLeft = 180;

    const timerInterval = setInterval(() => {
        timeLeft--;
        alarmButton.textContent = `⚠️ Olen kunnossa (${timeLeft})`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showMessageModal('⚠️ Your doctor will be notified as soon as possible', '🚨 VAROITUS - SYDÄMEN TOIMINTA POIKKEAA NORMISTA', 2);
            ahtung(data.inserted_id, userId, false); // если время истекло и не нажали
            callEmergency(data, userId);
            console.log('AHTUNG TEHTY');
        }
    }, 1000);

};

async function rebuildAiText(textData) {
    const aiUserBlock = document.querySelector('#patient-ai-text');

    aiUserBlock.textContent = textData;
};

async function ahtung(insertedID, userID, answered) {
    try {
        const url = 'https://hesh.northeurope.cloudapp.azure.com/api/emergency/';
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
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/metrics/${patID}`;
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


export {
    ahtung,
    monitorHRVStatus,
    rebuildAiText,
    getMetric
};
