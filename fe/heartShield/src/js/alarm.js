import { fetchData } from "./fetch";
import { createMod } from "./mods";
import { getUserInfo } from "./users";
import { getMetric } from "./hrvAnalyzer";
import { getFullAiResponse } from "./users";

function alarmChecker(doc) {
    setInterval(async () => {
        console.log('checks alarms');
        try {
            console.log('ID DOC:', doc);
            const url = `http://localhost:3000/api/emergency/${doc}`; 
            const options = {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetchData(url, options);

            if (!response) {
                throw new Error('Ошибка при проверке тревоги');
            } else if (response.check.length > 0) {
                console.log(response.check[0]);
                await createDocNotification(response.check[0]);
            }

        } catch (err) {
            console.error('Ошибка при проверке тревог:', err);
        }
    }, 20000); // 20 секунд
};



async function fillDocNotification(params) {
    const patientInfo = await getUserInfo(params.pat_id, 'pot');
    const patientMetric = await getMetric(params.pat_id);
    const patAiRes = await getFullAiResponse(params.pat_id);
    console.log('PATIENT DATA:', patientInfo);
    console.log('PATIENT METRICS', patientMetric[0]);
    console.log('PATIENT AI RESPONSE:', patAiRes);

    const blocks = {
        name: document.querySelector('.alarm-dia-main-name'),
        rmssd: document.querySelector('#alarm-dia-metric-rmssd'),
        sdnn: document.querySelector('#alarm-dia-metric-sdnn'),
        pat_ai: document.querySelector('#alarm-dia-pat-ai'),
        doc_ai: document.querySelector('#alarm-dia-doc-ai'),
        alarm_id: document.querySelector('#alarm-id'),
        check_but: document.querySelector('#close-dialog-button'),
    };

    async function changeDocCheck() {
        await checkDocNotification(params.res_id);
        blocks.check_but.removeEventListener('click', changeDocCheck);
    };

    blocks.name.textContent = `${patientInfo.name} ${patientInfo.surname}`;
    blocks.rmssd.textContent = patientMetric[0].rmssd;
    blocks.sdnn.textContent = patientMetric[0].sdnn;
    blocks.pat_ai.textContent = patAiRes[0].result_pat_text;
    blocks.doc_ai.textContent = patAiRes[0].result_doc_text;
    blocks.alarm_id.textContent = params.res_id;

    blocks.check_but.addEventListener('click', changeDocCheck);
};

async function createDocNotification(data) {
    createMod(7);
    await fillDocNotification(data);
};

async function checkDocNotification(resID) {
    try {
        const url = `http://localhost:3000/api/emergency/${resID}`;
        const options = {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-type': 'application/json',
            },
        };
        const response = await fetchData(url, options);
        console.log('CHECKDOCNOTIFICATION:', response);
        return response;
    } catch (e) {
        console.error('Mistake to switch doc notify:', e)
    }
};


export { alarmChecker };
