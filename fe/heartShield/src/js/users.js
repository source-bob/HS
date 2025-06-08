import { fetchData } from "./fetch";
import { createMod, formatDate } from "./mods";
import { rebuildAiText, getMetric } from "./hrvAnalyzer";

const modBody = document.querySelector('#dia-main-block');
const diaBody = document.querySelector('#dia-body');

const getUsers = async () => {

    const userType = localStorage.getItem('user_type');
    let url;
    let blockTarget;
    let usersFill = false;
    if (userType === 'adm') {
        url = 'http://localhost:3000/api/users';
        blockTarget = '#list-of-users';
        usersFill = true;
    } else if (userType === 'doc') {
        url = `http://localhost:3000/api/users/${localStorage.getItem('user_id')}`;
        blockTarget = '#doc-patients';
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const users = await fetchData(url, options);

    if (users.error) {
        console.log('tapahtui virhe fetch haussa');
        return
    }

    console.log('users:', users);
    
    if (userType === 'adm') {
        await countAndFillUsers(users);
    }

    await createBlocks(users, userType, blockTarget);
};

const countAndFillUsers = async (users) => {
    const counts = {
      pot: 0,
      doc: 0,
      adm: 0,
    };
  
    users.forEach(user => {
      if (counts[user.user_type] !== undefined) {
        counts[user.user_type]++;
      }
    });
    
    console.log('counts:', counts);

    const patientCount = document.querySelector('#top-part-row-patient');
    const doctorCount = document.querySelector('#top-part-row-doctor');
    const adminCount = document.querySelector('#top-part-row-admin');

    patientCount.textContent = counts.pot;
    doctorCount.textContent = counts.doc;
    adminCount.textContent = counts.adm;

    return [counts.pot, counts.doc, counts.adm];
  };

const getUserInfo = async (userId, userType) => {

    const url = `http://localhost:3000/api/users/${userType}/${userId}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const userData = await fetchData(url, options);
    

    return userData;
};

const getLastAiResponse = async (userId) => {
    const url = `http://localhost:3000/api/ai/${userId}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const aiResult = await fetchData(url, options);

    return aiResult;
};

const getFullAiResponse = async (userId) => {
    const url = `http://localhost:3000/api/ai/full/${userId}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const aiResult = await fetchData(url, options);

    return aiResult;
};

const createBlocks = async (blocks, blockType, blockTarget) => {
    
    const blockArea = document.querySelector(blockTarget);
    
    if (blockType === 'adm') {
        let statusName;
        blocks.forEach((block) => {
            if (block.user_type === 'pot') {
                statusName = 'Patient:';
            } else if (block.user_type === 'doc') {
                statusName = 'Doctor:';
            } else if (block.user_type === 'adm') {
                statusName = 'Admin:';
            }

            const displayBlock = document.createElement('div');
            displayBlock.className = 'adm-user-block';
            displayBlock.innerHTML = `
            <div class="status-name-block">
                <div class="status-piece">${statusName}</div>
                <div class="name-piece">${block.first_name}</div>
                <div class="second-name-piece">${block.last_name}</div>
            </div>
            <div class="user-id-block">
                <div class="user-id-header">ID:</div>
                <div class="user-id-value">${block.user_id}</div>
            </div>
            <div class="del-button-block">
                <button class="del-user-button">Poista käyttäjä</div>
            </div>`;

            blockArea.appendChild(displayBlock);
        });
    } else if (blockType === 'doc') {
        blocks.forEach((block) => {

            const blockBody = document.createElement('div');
            blockBody.className = 'patient-block';

            blockBody.innerHTML = `
            <div class="patient-block-header">
                <div class="patient-block-header-status-name">
                    <div class="patient-block-header-status">Patient:</div>
                    <div class="patient-block-header-name">${block.name} ${block.surname}</div>
                </div>
                <div class="patient-block-header-id">
                    <div class="patient-block-header-id-head">ID:</div>
                    <div class="patient-block-header-id-value">${block.id}</div>
                </div>
            </div>
            <div class="patient-block-hrv">
                <div class="patient-block-hrv-header">HRV:</div>
                <div class="patient-block-hrv-value">Tähän tulee mittauksia</div>
            </div>
            <div class="patient-block-buttons">
                <div class="patient-block-buttons-part">
                    <button class="patient-block-button" id="patient-ai-reports">Näytä AI-raportti</button>
                    <button class="patient-block-button" id="patient-tautihistoria">Tautihistoria</button>
                </div>
                <div class="patient-block-buttons-part">
                    <button class="patient-block-button" id="patient-mittaukset">Potilaan mittauskaavio</button>
                    <button class="patient-block-button" id="patient-suositukset">Lisää/muokkaa suosituksia</button>
                </div>
            </div>`;
            
            blockArea.appendChild(blockBody);
        });
        addDocEventListeners();
    }
};

const fillUserData = async () => {
    const userIdStorage = localStorage.getItem('user_id');

    const nameValue = document.querySelector('#main-info-name-value');
    const idValue = document.querySelector('#main-info-id-value');
    const statusValue = document.querySelector('#main-info-status-value');

    let status;
    const userTypeStorage = localStorage.getItem('user_type');
    if (userTypeStorage === 'adm') {
        status = 'Admin:';
    } else if (userTypeStorage === 'doc') {
        status = 'Doctor:';
    } else if (userTypeStorage === 'pot') {
        status = 'Patient:'
    }

    const userData = await getUserInfo(userIdStorage, userTypeStorage);

    statusValue.textContent = status;
    nameValue.textContent = `${userData.name} ${userData.surname}`;
    idValue.textContent = userIdStorage;
};

const fillPatientData = async () => {
    const userIdStorage = localStorage.getItem('user_id');
    
    const nameBlock = document.querySelector('#patient-info-name-value');
    const idBlock = document.querySelector('#patient-info-id-value');
    const ageBlock = document.querySelector('#patient-info-age-value');

    const userData = await getUserInfo(userIdStorage, 'pot');
    const lastAiResponse = await getLastAiResponse(userIdStorage);
    const aiUserBlock = document.querySelector('#patient-ai-text');

    console.log('AI RES:', lastAiResponse.data.result_pat_text);
    

    console.log(userData);
    const ageValue = await getAge(userData.dateofbirth);

    localStorage.setItem('pat_age', ageValue);

    const aiData = lastAiResponse.data.result_pat_text;
    
    await rebuildAiText(aiData);

    nameBlock.textContent = `${userData.name} ${userData.surname}`;
    idBlock.textContent = userData.id;
    ageBlock.textContent = `${ageValue} vuotta`;
};

const getAge = async (dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
  
    // проверка, был ли день рождения уже в этом году
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  
    if (!hasHadBirthdayThisYear) {
      age--;
    }
  
    return age;
};

const addEventListenersPatient = async () => {
    const buttonHrv = document.querySelector('#patient-buttons-hrv');
    const buttonHistoria = document.querySelector('#patient-buttons-historia');
    const buttonMittari = document.querySelector('#patient-buttons-mittari');
    const buttonSuosituksia = document.querySelector('#patient-buttons-suosituksia');
    const buttonAlarm = document.querySelector('#patient-alarm-button');

    buttonHrv.addEventListener('click', () => {
        createMod(1);
    });
    buttonHistoria.addEventListener('click', () => {
        createMod(2);
    });
    buttonMittari.addEventListener('click', () => {
        createMod(3);
    });
    buttonSuosituksia.addEventListener('click', () => {
        createMod(4);
    });
    buttonAlarm.addEventListener('click', () => {
        createMod(5);
    });
};

const addDocEventListeners = () => {
    document.querySelectorAll('.patient-block').forEach((div) => {
        console.log(div);

        const patientID = div.querySelector('.patient-block-header-id-value').textContent.trim();

        const aiReport = div.querySelector('#patient-ai-reports');
        const tautihistoria = div.querySelector('#patient-tautihistoria');
        const mittauskaavio = div.querySelector('#patient-mittaukset');
        const suositukset = div.querySelector('#patient-suositukset');

        aiReport.addEventListener('click', async () => {
            await getPatAIreports(patientID);
        });

        tautihistoria.addEventListener('click', async () => {
            await getPatTautihistoria(patientID);
        });

        mittauskaavio.addEventListener('click', async () => {
            await getPatMittauskaavio(patientID);
        });

        suositukset.addEventListener('click', () => {
            createMod(11);
        });
    });
};

const getPatMittauskaavio = async (patID) => {
    createMod(10);

    const patientInfo = await getUserInfo(patID, 'pot');
    const patientMetrics = await getMetric(patID);

    if (!patientMetrics || patientMetrics.length === 0) {
        document.querySelector('#dia-main-block').textContent = 'No Metrics Available';
        return;
    }

    const diaBody = document.querySelector('#dia-body');

    // Создаём кнопки
    const buttons = document.createElement('div');
    buttons.className = 'mod10-buttons';
    buttons.innerHTML = `
        <div class="mod10-button">
            <button class="mod10-nav-button" id="mod10-button-uusi">Uusi</button>
        </div>
        <div class="mod10-button">
            <button class="mod10-nav-button" id="mod10-button-vanha">Vanha</button>
        </div>
    `;
    diaBody.appendChild(buttons);

    const blocks = {
        pot_name: document.querySelector('#but-header-part-name'),
        pot_surname: document.querySelector('#but-header-part-surname'),
        metric_date: document.querySelector('.mod10-date'),
        hr: document.querySelector('#mod10-table-cell-hr'),
        sdnn: document.querySelector('#mod10-table-cell-sdnn'),
        rmssd: document.querySelector('#mod10-table-cell-rmssd'),
        pnn50: document.querySelector('#mod10-table-cell-pnn50'),
        lf_hf: document.querySelector('#mod10-table-cell-lfhf'),
        rr_mean: document.querySelector('#mod10-table-cell-rrmean'),
        new_button: document.querySelector('#mod10-button-uusi'),
        old_button: document.querySelector('#mod10-button-vanha'),
    };

    blocks.pot_name.textContent = patientInfo.name;
    blocks.pot_surname.textContent = patientInfo.surname;

    attachMetricsNavigation(blocks, patientMetrics);
};

const renderMetric = (blocks, metric) => {
    blocks.metric_date.textContent = formatDate(metric.metric_date);
    blocks.hr.textContent = `${metric.hr} bpm`;
    blocks.sdnn.textContent = `${metric.sdnn} ms`;
    blocks.rmssd.textContent = `${metric.rmssd} ms`;
    blocks.pnn50.textContent = `${metric.pnn50} %`;
    blocks.lf_hf.textContent = `${metric.lf_hf} ratio`;
    blocks.rr_mean.textContent = `${metric.rr_mean} ms`;
};

const attachMetricsNavigation = (blocks, metrics) => {
    let resNum = 0;

    const update = () => {
        renderMetric(blocks, metrics[resNum]);
        blocks.new_button.disabled = resNum === 0;
        blocks.old_button.disabled = resNum === metrics.length - 1;
    };

    blocks.new_button.addEventListener('click', () => {
        if (resNum > 0) {
            resNum--;
            update();
        }
    });

    blocks.old_button.addEventListener('click', () => {
        if (resNum < metrics.length - 1) {
            resNum++;
            update();
        }
    });

    update(); // начальная отрисовка
};


const getPatAIreports = async (patID) => {
    createMod(8);
    const modBody = document.querySelector('#dia-main-block');
    

    const patientInfo = await getUserInfo(patID, 'pot');
    const patientAIres = await getFullAiResponse(patID);

    console.log('PATRESS:', patientAIres);

    if (patientAIres.length > 0) {
        const buttons = document.createElement('div');
        buttons.className = 'mod8-buttons';
        buttons.innerHTML = `
            <div class="mod8-button">
                <button class="mod8-ai-button" id="mod8-button-uusi">Uusi</button>
            </div>
            <div class="mod8-button">
                <button class="mod8-ai-button" id="mod8-button-vanha">Vanha</button>
            </div>`;
        diaBody.appendChild(buttons);

        const blocks = {
            pot_name: document.querySelector('#but-header-part-name'),
            pot_surname: document.querySelector('#but-header-part-surname'),
            risk_value: document.querySelector('#mod8-risk-value'),
            pat_res_value: document.querySelector('#mod8-pat-value'),
            doc_res_value: document.querySelector('#mod8-doc-value'),
            new_button: document.querySelector('#mod8-button-uusi'),
            old_button: document.querySelector('#mod8-button-vanha'),
        };

        blocks.pot_name.textContent = patientInfo.name;
        blocks.pot_surname.textContent = patientInfo.surname;

        attachReportNavigation(blocks, patientAIres);

    } else {
        modBody.textContent = 'No Data For Read';
    }
};

const renderAIreport = (blocks, report) => {
    blocks.risk_value.textContent = report.result_status;
    blocks.pat_res_value.textContent = report.result_pat_text;
    blocks.doc_res_value.textContent = report.result_doc_text;
};

const attachReportNavigation = (blocks, reports) => {
    let resNum = 0;

    const update = () => {
        renderAIreport(blocks, reports[resNum]);
        blocks.new_button.disabled = resNum === 0;
        blocks.old_button.disabled = resNum === reports.length - 1;
    };

    blocks.new_button.addEventListener('click', () => {
        if (resNum > 0) {
            resNum--;
            update();
        }
    });

    blocks.old_button.addEventListener('click', () => {
        if (resNum < reports.length - 1) {
            resNum++;
            update();
        }
    });

    update(); // начальная отрисовка
};


const getPatTautihistoria = async (patID, amount) => {
    createMod(9);
};

const getPatSuositukset = async (patID, amount) => {};
  

export { getUsers, fillUserData, fillPatientData, addEventListenersPatient, getUserInfo, getLastAiResponse, getFullAiResponse };