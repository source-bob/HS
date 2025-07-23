import { fetchData } from "./fetch";
import { createMod, formatDate } from "./mods";
import { fillPatientData, getUserInfo } from "./users";
import { getMetric } from "./hrvAnalyzer";
import { getFullAiResponse, getPatAddInfo, newAlarmPatient } from "./users";
import {
    selectBlock,
    showMessageModal,
    showErrorModal,
    createEmptyBlocks,
    fillBlocks
} from "./mech";
import { getPos } from "./geo";

function alarmChecker(doc) {
    setInterval(async () => {

        
        console.log('checks alarms...');
        try {
            const patAlarms = await getAlarms(doc);
            const patMsg = await getAlarmsMsg(doc);

            let params = [false, false];

            if (!patAlarms && !patMsg) {
                console.log('No Alarms at the moment');
                return;
            } else if (!patAlarms && patMsg) {
                params[1] = patMsg;
            } else if (!patMsg && patAlarms) {
                params[0] = patAlarms;
            } else {
                params = [patAlarms, patMsg];
                
            }
            await createDocNotification(params);
            return;

        } catch (err) {
            console.error('error in alarmChecker', err);
        }
    }, 20000); // 20 sec
};

async function getAlarms(docID) {
    try {
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/emergency/${docID}`; 
        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        };

        const response = await fetchData(url, options);

        if (!response) {
            return false;
        } else if (response.check.length > 0) {
            return response.check[0];
        } else {
            return false;
        }

    } catch (err) {
        console.error('Error alarm checking:', err);
    }
};

async function getAlarmsMsg(docID) {
        try {
            const url = `https://hesh.northeurope.cloudapp.azure.com/api/emergency/msg/${docID}`; 
            const options = {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetchData(url, options);

            if (!response) {
                throw new Error('No messages found.');
            } else if (response.length > 0) {
                console.log(response[0]);
                return response[0];
            } else {
                return false;
            }

        } catch (err) {
            console.error('Message cjeck error:', err);
        }
};

async function fillDocNotification([data, kytkin]) {
    
    const patientID = data.pat_id;
    let checkParams = [0, 0];
    let ids;
    let values;
   
    const patientInfo = await getUserInfo(patientID, 'pot');
    const patientMetric = await getMetric(patientID);
    const patAiRes = await getFullAiResponse(patientID);

    if (kytkin === 0) {
        ids = [
            'alarm-dia-main-name',
            'alarm-dia-metric-rmssd',
            'alarm-dia-metric-sdnn',
            'alarm-dia-pat-ai',
            'alarm-dia-doc-ai',
            'alarm-id',
            'mod7-pot-answer'
        ];

        values = [
            `${patientInfo.name} ${patientInfo.surname}`,
            patientMetric[0].rmssd,
            patientMetric[0].sdnn,
            patAiRes[0].result_pat_text,
            patAiRes[0].result_doc_text,
            data.res_id,
            data.pat_check === 1?
            'Potilas answered ilmoitukseen.' : 'Potilas ei vastanut ilmoitukseen.'
        ];
        await createMod(7);
    } else if (kytkin === 1) {
        ids = [
            'alarm-dia-main-name',
            'mod20-pat-symptoms-value',
            'mod20-pat-msg-value',
            'mod20-doc-action-value'
        ];

        values = [
            `${patientInfo.name} ${patientInfo.surname}`,
            data.symptoms,
            data.pat_msg,
            'Lääkärin tulee reagoida viipymättä'
        ];
        await createMod(20);
    }

    

    async function changeDocCheck() {
        
        checkBut.removeEventListener('click', changeDocCheck);
        if (kytkin === 0) {
            checkParams = [data.res_id, 0];
            await checkDocNotification(checkParams);
        } else if (kytkin === 1) {
            checkParams = [data.msg_id, 1];
            await checkDocNotification(checkParams);
        }
        
        checkBut.removeEventListener('click', changeDocCheck);
    };

    const checkBut = await selectBlock('close-dialog-button');

    const blocks = await createEmptyBlocks(ids);
    const filledBlocks = await fillBlocks(blocks, values);
    console.log(filledBlocks);
    
    checkBut.addEventListener('click', changeDocCheck);
    return;
};

async function createDocNotification(params) {
    console.log('params', params);

    let kytkin;

    const options = {
        0: [params[0], 0],
        1: [params[1], 1]
    };

    if (!params[0] && params[1]) {
        kytkin = 1;
    } else if (params[0] && !params[1]) {
        kytkin = 0;
    } else {
        const alarmDate = formatDate(params[0].alarm_date);
        const msgDate = formatDate(params[1].msg_date);
        if (alarmDate < msgDate) {
            kytkin = 1;
        } else {
            kytkin = 0;
        }
    }

    await fillDocNotification(options[kytkin]);
};

async function checkDocNotification([resID, tableID]) {
    
    let urlEnd;

    if (tableID === 0) {
        urlEnd = '';
    } else if (tableID === 1) {
        urlEnd = 'msg/';
    }

    try {
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/emergency/${urlEnd}${resID}`;
        const options = {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-type': 'application/json',
            },
        };
        const response = await fetchData(url, options);
        return response;
    } catch (e) {
        console.error('Mistake to switch doc notify:', e)
    }
};

const createPatientAlarm = async () => {
  const mod5 = await selectBlock('mod5');
  const oireet = [];
  
  // Найти все div.mod5-oire внутри mod5
  const oireBlocks = mod5.querySelectorAll('.mod5-oire');
  oireBlocks.forEach(oireBlock => {
    const checkbox = oireBlock.querySelector('input[type="checkbox"]');
    const label = oireBlock.querySelector('.mod5-oire-header');
    if (checkbox.checked) {
      oireet.push(label.textContent.trim());
    }
  });

  let oireStr = oireet.join('; ');


  // Получить текст из текстового поля
  let extraText = mod5.querySelector('#mod5-oire-text')?.value.trim() || '';

  if (oireet.length === 0 && extraText === '') {
    showErrorModal(newAlarmPatient, '⚠️ Sun tarvi valittaa oire tai kirjoittaa teksti', '🚨 Ilmoita oireista / hätätilanne', 2);
    return;
  } else if (extraText === '') {
    extraText = 'empty';
  } else if (oireet.length === 0) {
    oireStr = 'empty';
  }

  console.log(oireet, extraText);

  const response = await savePatientAlarm(oireStr, extraText);


  if (!response || response.error) {
    showErrorModal(newAlarmPatient, '⚠️ something went wrong, try again.', '🚨 Ilmoita oireista / hätätilanne', 2);
  }
};

const savePatientAlarm = async (oireet, userText) => {
    const userID = localStorage.getItem('user_id');
    try {
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/emergency/${userID}`;
        const options = {
            body: JSON.stringify({
                symptoms: oireet,
                pat_msg: userText
            }),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
        };

        const response = await fetchData(url, options);
        console.log('INSERTED ID:', response);
        
        if (response) {
            showMessageModal('⚠️ Doctor will be notified mahdollisimman pian.', '🚨 Ilmoita oireista / hätätilanne', 2);
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error(e.message);
        return false;
    }
};

const callEmergency = async (data, userId) => {

    const userData = await getUserInfo(userId, 'pot');
    const userLocation = await getPos();
    const userAddInfo = await getPatAddInfo(userId);
    const docData = await getUserInfo(userData.doc, 'doc');
    const patMetrics = await getMetric(userId);

    const promptData = {
        prompt_name: 'Emergency call',
        patient_name: `${userData.name} ${userData.surname}`,
        patient_birthday: userData.dateofbirth,
        patient_phone: userData.phone,
        patient_location: userLocation,
        patient_last_metrics: patMetrics,
        patient_last_mi: userAddInfo.mi_date,
        docs_name: `${docData.name} ${docData.surname}`,
        docs_phone: docData.phone,
        emergency_msg: `
        Välitön toimenpide tarpeen.
        Potilaan tila on kriittinen - mahdollinen tajunnanmenetys tai muu kiireellinen terveydentilan heikkeneminen.
        Potilas ei vastaa ilmoituksiin.

        Pyydämme viipymättä:
        - ottamaan yhteyttä potilaaseen ja vastuulääkäriin tai
        - lähettämään ensihoitoyksikön ilmoitettuihin koordinaatteihin.

        Ystävällisin terveisin,
        Etävalvontajärjestelmä potilaiden terveydentilan seurantaan
        heartShield`
    };

    console.log('Emergency called', promptData);
/*
    const url = `https://sairala:3000/api/emergency`;
    const options = {
        body: JSON.stringify(promptData),
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetchData(url, options);
        if (response) {
            console.log(response);
            return true;
        } else {
            console.log('something went wrong');
            return false;
        }
    } catch (e) {
        console.error('error:', e.message);
        return false;
    }*/
};

export { callEmergency, createPatientAlarm, alarmChecker };
