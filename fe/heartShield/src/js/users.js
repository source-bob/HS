import { fetchData } from "./fetch";
import { createMod, formatDate } from "./mods";
import { ahtung, rebuildAiText, getMetric } from "./hrvAnalyzer";
import { createPatientAlarm } from "./alarm";
import {
    showMessageModal,
    createButton,
    selectBlock,
    getVal,
    showErrorModal,
    makeModHeader,
    userType,
    userID,
    createEmptyBlocks,
    fillBlocks
} from "./mech";

const modBody = document.querySelector('#dia-main-block');
const diaBody = document.querySelector('#dia-body');

const getUsers = async () => {

    const userType = localStorage.getItem('user_type');
    let url;
    let blockTarget;
    let usersFill = false;
    if (userType === 'adm') {
        url = 'https://hesh.northeurope.cloudapp.azure.com/api/users';
        blockTarget = '#list-of-users';
        usersFill = true;
    } else if (userType === 'doc') {
        url = `https://hesh.northeurope.cloudapp.azure.com/api/users/${localStorage.getItem('user_id')}`;
        blockTarget = '#doc-patients';
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const users = await fetchData(url, options);

    if (!users || users.length === 0) {
        await createBlocks('No data for read', userType, blockTarget, 1);
        return;
    }

    if (users.error) {
        console.log('tapahtui virhe fetch haussa');
        return
    }
    
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

const getPatReccomendations = async (patID) => {
    const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/recom/${patID}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const userRecomms = await fetchData(url, options);

    return userRecomms;
};

const getUserInfo = async (userId, userType) => {

    const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/${userType}/${userId}`;
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
    const url = `https://hesh.northeurope.cloudapp.azure.com/api/ai/${userId}`;
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
    const url = `https://hesh.northeurope.cloudapp.azure.com/api/ai/full/${userId}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const aiResult = await fetchData(url, options);

    return aiResult;
};

const createBlocks = async (blocks, blockType, blockTarget, empty=0) => {
    
    const blockArea = document.querySelector(blockTarget);
    blockArea.innerHTML = '';
    if (empty === 1) {
        const emptyBlock = `
            <div class="status-name-block">
            </div>
            <div class="user-id-block">
                <div class=mod-div-message>No data for read.</div>
            </div>`;
        blockArea.appendChild(emptyBlock);
        return;
    }
    if (blockType === 'adm') {
        let statusName;
        blocks.forEach((block) => {
            if (block.user_type === 'pot') {
                statusName = '📋 Patient:';
            } else if (block.user_type === 'doc') {
                statusName = '🩺 Doctor:';
            } else if (block.user_type === 'adm') {
                statusName = '🔧 Admin:';
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
                <div class="user-id-value" id="patient-block-header-id-value">${block.user_id}</div>
            </div>
            <div class="del-button-block">
                <button class="del-user-button">❌ Delete user</div>
            </div>`;

            blockArea.appendChild(displayBlock);
        });
        await addAdmEventListeners();
    } else if (blockType === 'doc') {
        for (const block of blocks) {
            let hrvSign = '🔘';
            let hrvStatus = 'Not Availible';
            let rmssdValue = '-';
            let sdnnValue = '-';
            const metrics = await getMetric(block.id);
            if (metrics[0]) {
                const userHrv = metrics[0].hrv_status;
                if (userHrv === 'Alhainen') {
                    hrvSign = '🔴';
                } else if (userHrv === 'Normaali') {
                    hrvSign = '🟢';
                } else if (userHrv === 'Korkea') {
                    hrvSign = '🔵';
                }
                hrvStatus = userHrv;
                rmssdValue = metrics[0].rmssd;
                sdnnValue = metrics[0].sdnn;
            }

            

            const blockBody = document.createElement('div');
            blockBody.className = 'patient-block';

            blockBody.innerHTML = `
            <div class="patient-block-header">
                <div class="patient-block-header-status-name">
                    <div class="patient-block-header-status">📋 Potilas:</div>
                    <div class="patient-block-header-name">${block.name} ${block.surname}</div>
                </div>
                <div class="patient-block-header-id">
                    <div class="patient-block-header-id-head">ID:</div>
                    <div class="patient-block-header-id-value">${block.id}</div>
                </div>
            </div>
            <div class="patient-block-hrv">
                <div class="patient-block-hrv-header">${hrvSign} HRV:</div>
                <div class="patient-block-hrv-value">${hrvStatus} (SDNN = ${sdnnValue}, RMSSD = ${rmssdValue})</div>
            </div>
            <div class="patient-block-buttons">
                <div class="patient-block-buttons-part">
                    <button class="patient-block-button" id="patient-ai-reports">🤖 Näytä AI-raportti</button>
                    <button class="patient-block-button" id="patient-tautihistoria">📖 Tautihistoria</button>
                </div>
                <div class="patient-block-buttons-part">
                    <button class="patient-block-button" id="patient-mittaukset">📈 Potilaan mittauskaavio</button>
                    <button class="patient-block-button" id="patient-suositukset">✍️ Lisää/muokkaa suosituksia</button>
                </div>
            </div>`;
            
            blockArea.appendChild(blockBody);
        };
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
        status = '🧑‍💻 adm:';
    } else if (userTypeStorage === 'doc') {
        status = '👨‍⚕️ doc:';
    } else if (userTypeStorage === 'pot') {
        status = '🧍‍♂️ pat:'
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
    

    const ageValue = await getAge(userData.dateofbirth);

    localStorage.setItem('pat_age', ageValue);

    let aiData;

    if (!lastAiResponse.data) {
        aiData = 'no data for read at the moment, continue monitoring';
    } else {
        aiData = lastAiResponse.data.result_pat_text;
    }
    
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

const newAlarmPatient = async () => {
    createMod(5);
    console.log('CREATING ALARM');
    makeModHeader('🚨 Ilmoita oireista / hätätilanne');
    const ilmoitusButton = await createButton('pat-alarm-doc', 'dia-control-button', '⚠️ Ilmoittaa lääkärille', createPatientAlarm);
    const diaBody = await selectBlock('dia-body');
    
    diaBody.appendChild(ilmoitusButton);
    
};

const addEventListenersPatient = async () => {

    const blocks = {
        butHrv: await selectBlock('patient-buttons-hrv'),
        butHistoria: await selectBlock('patient-buttons-historia'),
        butMittari: await selectBlock('patient-buttons-mittari'),
        butSuosituksia: await selectBlock('patient-buttons-suosituksia'),
        butAlarm: await selectBlock('patient-alarm-button')
    };

    blocks.butHrv.addEventListener('click', () => {
        createMod(1);
    });
    blocks.butHistoria.addEventListener('click', async () => {
        await showPatMetrics();
    });
    blocks.butMittari.addEventListener('click', () => {
        createMod(3);
    });
    blocks.butSuosituksia.addEventListener('click', async () => {
        await showPatSuositukset();
    });
    blocks.butAlarm.addEventListener('click', async () => {
        await newAlarmPatient();
    });
};



const showPatSuositukset = async () => {
    createMod(4);
    makeModHeader('🩺 Lääkärin suositukset');

    const patRecomendations = await getPatReccomendations(localStorage.getItem('user_id'));
    console.log(patRecomendations);

    patRecomendations.forEach(async (recommendation) => {
        const modBody = await selectBlock('dia-main-block');
        const mod4Row = document.createElement('div');
        mod4Row.className = 'mod4-row';

        mod4Row.innerHTML = `
        <div class="sign-block">-</div>
        <div class="mod4-row-value">${recommendation.rec_text}</div>`;

        modBody.appendChild(mod4Row);
    });
};

const showPatMetrics = async () => {
    createMod(2);
    const patMetrics = await getMetric(localStorage.getItem('user_id'));
    console.log(patMetrics);

    makeModHeader(`📜 Mittaushistoria`);

    patMetrics.forEach(async (metric) => {
        const modBody = await selectBlock('dia-main-block');
        const mod12Row = document.createElement('div');
        const fullDate = formatDate(metric.metric_date);
        const onlyDate = fullDate.split(' klo ')[0];
        mod12Row.className = 'mod12-row';
        mod12Row.innerHTML = `
        <div class="sign-block">📅</div>
        <div class="mod12-row-cell">
            <div class="mod12-row-value" id="metric-date-value">${onlyDate}</div>
        </div>
        <div class="sign-block">︱</div>
        <div class="mod12-row-cell">
            <div class="mod12-row-header">RMSSD:</div>
            <div class="mod12-row-value" id="metric-rmssd-value">${metric.rmssd}</div>
        </div>
        <div class="sign-block">︱</div>
        <div class="mod12-row-cell">
            <div class="mod12-row-header">SDNN:</div>
            <div class="mod12-row-value" id="metric-sdnn-value">${metric.sdnn}</div>
        </div>
        <div class="sign-block">︱</div>
        <div class="mod12-row-cell">
            <div class="mod12-row-value">${metric.hrv_status}</div>
        </div>`;

        modBody.appendChild(mod12Row);
    });
};

const addAdmEventListeners = async () => {
    const newUser = await selectBlock('adm-new-user');
    const findUser = await selectBlock('adm-find-user');

    findUser.addEventListener('click', async () => {
        await admFindUser();
    });

    newUser.addEventListener('click', async () => {
        await createNewPatient();
    });

    // Добавляем слушатели на кнопки удаления пользователей
    const deleteButtons = document.querySelectorAll('.del-user-button');

    deleteButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const userBlock = button.closest('.adm-user-block');
            const userId = userBlock.querySelector('#patient-block-header-id-value')?.textContent?.trim();

            if (!userId) {
                console.error('User ID not found');
                return;
            }

            const response = await deleteUserById(userId);
            if (response) {
                userBlock.remove();
                await showMessageModal('⚠️ user deleted', '❌ Delete user');
            }

            // Удаляем блок из DOM после успешного удаления
            
        });
    });
};

const addDocEventListeners = () => {
    const newPatient = document.querySelector('#doc-new-pot');
    const deletePatient = document.querySelector('#doc-del-pot');

    deletePatient.addEventListener('click', async () => {
        await patientDeleter();
    });

    newPatient.addEventListener('click', async () => {
        await createNewPatient();
    });
    document.querySelectorAll('.patient-block').forEach((div) => {

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

        suositukset.addEventListener('click', async () => {
            await getPatRecommendations(patientID);
        });
    });
};

const getPatRecommendations = async (patientID) => {
    localStorage.setItem('current_patient', patientID);
    await getPatSuosituksia();
    return;
};

const saveNewRecom = async () => {
    const recomBlock = await selectBlock('mod11-new-suositus');
    const modHeaderBuild = await selectBlock('dia-header-value');
    const modHeaderHTML = modHeaderBuild.innerHTML;

    const newRecomm = recomBlock.value.trim();

    if (!newRecomm) {
        showErrorModal(getPatSuosituksia, 'you have to add recomm.', modHeaderHTML);
        return false;
    }
    const patID = localStorage.getItem('pat_id');
    try {
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/recom/${patID}`;
        const options = {
            body: JSON.stringify({
                textData: newRecomm,
            }),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
        };

        const response = await fetchData(url, options);
        if (!response) {
            showErrorModal(getPatSuosituksia, 'something went wrong, try again', modHeaderHTML);
        } else {
            showMessageModal('recommendation saved.', modHeaderHTML);
        }
        console.log(response);
        console.log('privet');
    } catch (err) {
        showErrorModal(getPatSuosituksia, err, '');
    }
};

const getPatSuosituksia = async () => {
    createMod(11);
    const patID = localStorage.getItem('current_patient');
    console.log('SUOSITUKSIA', patID);
    const patMainData = await getUserInfo(patID, 'pot');
    const patData = await getPatReccomendations(patID);
    const lastRecom = patData[0];

    localStorage.setItem('pat_id', patID);

    console.log(lastRecom, patMainData);

    const saveRecommBut = await createButton('mod11-save-recom-but', 'dia-control-button', '💾 Talenna muutokset', saveNewRecom);
    diaBody.appendChild(saveRecommBut);
    const blocks = {
        last: await selectBlock('mod11-last-suositus'),
        patName: await selectBlock('but-header-part-name'),
        patSurname: await selectBlock('but-header-part-surname')
    };

    if (lastRecom) {
        blocks.last.textContent = lastRecom.rec_text;
    } else {
        blocks.last.textContent = 'No availible data';
    }
    blocks.patName.textContent = patMainData.name;
    blocks.patSurname.textContent = patMainData.surname;
};

const deleteUserById = async (userId) => {
    try {
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/${parseInt(userId)}`;
        const options = {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        };

        const response = await fetchData(url, options);

        if (!response || response.error) {
            console.error(`Ошибка при удалении пользователя ${userId}`);
            return false;
        } else {
            console.log(`Пользователь ${userId} успешно удалён`);
            return true;
        }
    } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
        return false;
    }
};

const collectUserFields = () => {
    const userType = localStorage.getItem('user_type');

    return {
        name: getVal('new-pot-name'),
        surname: getVal('new-pot-surname'),
        birthday: getVal('new-pot-dob'),
        ssn: getVal('new-pot-ht'),
        phone: getVal('new-pot-phone'),
        email: getVal('new-pot-mail'),
        password: getVal('new-pot-pass'),
        confirmPassword: getVal('new-pot-passconf'),
        userType: userType === 'adm'
            ? getVal('new-pot-type')
            : 'pot'
    };
};

const validateUserFields = (user) => {
    for (const key in user) {
        if (!user[key]) {
            return `Field "${key}" is required.`;
        }
    }

    if (user.password !== user.confirmPassword) {
        return 'Passwords not same';
    }

    return null;
};

const patientDeleter = async () => {
    createMod(17);
    const deleteButton = await createButton('new-save-button', 'dia-control-button', '❌ delete', deletePatient);
    console.log(deleteButton);
    diaBody.appendChild(deleteButton);
};

const deletePatient = async () => {
    const potID = getVal('delete-pot-id');
    if (!potID) {
        showErrorModal(patientDeleter, 'you have to put patient id', '👤 Delete patient');
    } else {
        const check = await checkDocPatient(potID, userID());
        console.log('CHECK', potID, check);
    }
};

const checkDocPatient = async (patientID, docID) => {
    console.log(patientID, docID);
    const patient = await getUserInfo(patientID, 'pot');
    if (!patient || patient.error) {
        showErrorModal(patientDeleter, 'Patient id not found', '👤 Delete patient');
        return false;
    } else {
        if (patient.doc !== docID) {
            console.log('CHECKING', patient.doc, docID);
            showErrorModal(patientDeleter, 'This is not your patient', '👤 Delete patient');
            return false;
        } else {
            const result = await deleteUserById(patientID);
            if (result) {
                showMessageModal('Patient deleted', '👤 Delete patient');
                getUsers(); 
                return true;
            } else {
                showErrorModal(patientDeleter, 'Something went wrong', '👤 Delete patient');
            }
        }
    }
};

const admFindUser = async () => {
    createMod(18);
    const modBody = await selectBlock('dia-body');
    const findButton = await createButton('search-user-but', 'dia-control-button', '🔍 Find', searchAdmUser);
    modBody.appendChild(findButton);
};

const searchAdmUser = async () => {
    const userID = await getVal('search-user-adm');
    if (!userID || userID.error) {
        showErrorModal(admFindUser, '❗ wrong or empty ID', '🔍 Find user');
    } else {
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/admin/${userID}`;
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        };

        const response = await fetchData(url, options);

        if (!response || response.userData.error || response.error) {
            showErrorModal(admFindUser, '❗ wrong ID, try again', '🔍 Find user');
        } else {
            await admUserFound(response.userData);
            return true;
        }
    }
};

const admUserFound = async (userData) => {
    console.log('USERDATA:', userData);
    await createMod(19);

    const { userID, userEmail, userType } = userData.mainData;
    const { dateofbirth, dateofregistration, henkilotunnus, id, name, phone, surname } = userData.addData;

    const blockValues = [
        'mod19-id-value',
        'mod19-type-value',
        'mod19-name-value',
        'mod19-email-value',
        'mod19-phone-value',
        'mod19-dob-value',
        'mod19-dor-value',
        'mod19-ht-value'
    ];

    const textValues = [
        userID,
        userType,
        userEmail,
        `${name} ${surname}`,
        phone,
        formatDate(dateofbirth),
        formatDate(dateofregistration),
        henkilotunnus
    ];
    const blocks = await createEmptyBlocks(blockValues);
    
    const diaBody = await selectBlock('dia-body');

    const filledBlocks = await fillBlocks(blocks, textValues);
    
    const backButton = await createButton('mod19-back-button', 'dia-control-button', '🔍 Find another', admFindUser);
    diaBody.appendChild(backButton);

    
};

const createNewPatient = async () => {
    createMod(12);

    const luoUusi = document.createElement('div');
    luoUusi.className = 'mod12-new-pat';
    luoUusi.innerHTML = `<button id="luo-uusi-pot">💾 Luo profiili</button>`;
    diaBody.appendChild(luoUusi);

    const newButton = document.querySelector('#luo-uusi-pot');
    newButton.addEventListener('click', async () => {
        await loadNewUser();
    });
};

const patData = async () => {
    createMod(14);
    const diaBody = await selectBlock('dia-body');
    const saveButton = await createButton('new-save-button', 'dia-control-button', '💾 save data', userAddInfo);

    diaBody.appendChild(saveButton);
};

const userAddInfo = async () => {
    const miDateInput = await selectBlock('new-pot-mi');
    const pillInput = await selectBlock('new-pot-drugs');
    const patientAge = localStorage.getItem('patient_age');
    const patientID = localStorage.getItem('patient_id');

    if (!miDateInput?.value.trim() || !pillInput?.value.trim()) {
        await showErrorModal(patData, 'Put MI date and pills', '➕ Create new patient');
        return;
    }

    if (!patientID || !patientAge) {
        await showErrorModal(patData, 'Patient ID or age missing', '➕ Create new patient');
        return;
    }

    const blocks = {
        id: patientID,
        age: patientAge,
        mi: miDateInput.value.trim(),
        pills: pillInput.value.trim()
    };

    console.log('Доп данные пациента:', blocks);

    const success = await loadAddData(blocks);
    
    if (success) {
        await userCreated();
    } else {
        await showErrorModal(patData, 'Something went wrong, try again.', '➕ Create new patient');
    }
    
};

const loadAddData = async (patientData) => {
    const { id, age, mi, pills } = patientData;
    
    const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/${id}`;
    const options = {
        body: JSON.stringify({
            age: age,
            mi_date: mi,
            pills: pills
        }),
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
    };

    const savedData = await fetchData(url, options);

    if (!savedData || savedData.error) {
        await showErrorModal(patData, 'Ошибка при создании пользователя', '➕ Create new patient');
        return false;
    }

    console.log('patient data added:', savedData);
    return true;
};

const userCreated = async () => {
    createMod(15);
    const userLvl = userType();
    makeModHeader(userLvl === 'doc' ? '➕ Create new patient' : '➕ Create new user');
    getUsers();
};

const loadNewUser = async () => {
    const user = collectUserFields();
    const errorMessage = validateUserFields(user);
    let userId;
    

    if (errorMessage) {
        const userLvl = userType();
        await showErrorModal(createNewPatient, errorMessage, '');
        makeModHeader(userLvl === 'doc' ? '➕ Create new patient' : '➕ Create new user');
        
        return;
    }

    console.log('USER DATA:', user);

    try {
        const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/`;
        const options = {
            body: JSON.stringify({
                name: user.name,
                surname: user.surname,
                birthday: user.birthday,
                ht: user.ssn,
                phone: user.phone,
                email: user.email,
                pass: user.password,
                user_type: user.userType,
                creator_id: userID(),
            }),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
        };

        const savedUser = await fetchData(url, options);

        if (!savedUser || savedUser.error) {
            await showErrorModal(createNewPatient, 'Ошибка при создании пользователя', '➕ Create new user');
            return;
        }

        userId = savedUser.userId;

        console.log('user saved:', savedUser);
    } catch (e) {
        console.error('mistake load main data');
    }

    if (user.userType === 'pot') {
        const userAge = await getAge(user.birthday);
        localStorage.setItem('patient_age', userAge);
        localStorage.setItem('patient_id', userId);
        await patData();
    } else {
        await userCreated();
    }
};

const getPatMittauskaavio = async (patID) => {
    createMod(10);

    const patientInfo = await getUserInfo(patID, 'pot');
    const patientMetrics = await getMetric(patID);

    

    const diaBody = document.querySelector('#dia-body');

    // Создаём кнопки
    const buttons = document.createElement('div');
    buttons.className = 'mod10-buttons';
    buttons.innerHTML = `
        <div class="mod10-button">
            <button class="mod10-nav-button" id="mod10-button-uusi">◀️ Uusi</button>
        </div>
        <div class="mod10-button">
            <button class="mod10-nav-button" id="mod10-button-vanha">Vanha ▶️</button>
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

    if (!patientMetrics || patientMetrics.length === 0) {
        const modHead = await selectBlock('dia-header-value');
        showMessageModal('No metrics availible', modHead.innerHTML);
        return;
    }

    
    

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

const getPatTautihistoria = async (patID) => {
    
    const patientInfo = await getUserInfo(patID, 'pot');
    createMod(9);

    const patientAddInfo = await getPatAddInfo(patID);
    if (!patientAddInfo || patientAddInfo.error) {
        diaBody.textContent = 'No data found';
    }

    const diaBody = await selectBlock('dia-body');

    const aiReports = await getFullAiResponse(patID);

    const blockValues = [
        'mod9-header-part-name',
        'mod9-header-part-surname',
        'mod9-mi-value',
        'mod9-reg-value',
        'mod9-pills-value',
        'mod9-ai-value'
    ];

    const blocks = await createEmptyBlocks(blockValues);

    console.log('BLOCKS:', blocks);
    console.log('patientINFO:', patientInfo);

    const textValues = [
        patientInfo.name,
        patientInfo.surname,
        formatDate(patientAddInfo.mi_date),
        formatDate(patientInfo.dateofregistration),
        patientAddInfo.pills,
        `${aiReports.length} kpl`
    ];

    const filledBlocks = await fillBlocks(blocks, textValues);
    
    console.log('blocks filled', filledBlocks);
    return;
};

const getPatAddInfo = async (patID) => {
    const url = `https://hesh.northeurope.cloudapp.azure.com/api/users/info/${patID}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    };

    const result = await fetchData(url, options);

    return result;
};

const getPatAIreports = async (patID) => {
    createMod(8);
    const modBody = document.querySelector('#dia-main-block');
    

    const patientInfo = await getUserInfo(patID, 'pot');
    const patientAIres = await getFullAiResponse(patID);

    console.log('PATRESS:', patientAIres);

    
    const buttons = document.createElement('div');
    buttons.className = 'mod8-buttons';
    buttons.innerHTML = `
        <div class="mod8-button">
            <button class="mod8-ai-button" id="mod8-button-uusi">◀️ Uusi</button>
        </div>
        <div class="mod8-button">
            <button class="mod8-ai-button" id="mod8-button-vanha">Vanha ▶️</button>
        </div>`;
    diaBody.appendChild(buttons);

    const blocks = {
        pot_name: document.querySelector('#but-header-part-name'),
        pot_surname: document.querySelector('#but-header-part-surname'),
        rep_date: await selectBlock('mod8-date-value'),
        risk_value: document.querySelector('#mod8-risk-value'),
        pat_res_value: document.querySelector('#mod8-pat-value'),
        doc_res_value: document.querySelector('#mod8-doc-value'),
        new_button: document.querySelector('#mod8-button-uusi'),
        old_button: document.querySelector('#mod8-button-vanha'),
    };

    blocks.pot_name.textContent = patientInfo.name;
    blocks.pot_surname.textContent = patientInfo.surname;

    if (patientAIres.length === 0) {
        const modHead = await selectBlock('dia-header-value');
        showMessageModal('No data for read', modHead.innerHTML);
        return;
    }

    attachReportNavigation(blocks, patientAIres);

    
};

const renderAIreport = (blocks, report) => {
    blocks.risk_value.textContent = report.result_status;
    blocks.pat_res_value.textContent = report.result_pat_text;
    blocks.doc_res_value.textContent = report.result_doc_text;
    blocks.rep_date.textContent = formatDate(report.result_date);
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

export {
    getUsers,
    fillUserData,
    fillPatientData,
    addEventListenersPatient,
    getUserInfo,
    getLastAiResponse,
    getFullAiResponse,
    getPatAddInfo,
    newAlarmPatient
};