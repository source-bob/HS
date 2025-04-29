import { fetchData } from "./fetch";
import { createMod } from "./mods";

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

const createBlocks = async (blocks, blockType, blockTarget) => {
    if (blockType === 'adm') {
        blocks.forEach((block) => {
            const displayBlock = document.createElement('div');
            displayBlock.className = 'adm-user-block';

            console.log(block.user_id);

            const statusNameBlock = document.createElement('div');
            statusNameBlock.className = 'status-name-block';

            const statusPiece = document.createElement('div');
            statusPiece.className = 'status-piece';

            if (block.user_type === 'pot') {
                statusPiece.textContent = 'Patient:';
            } else if (block.user_type === 'doc') {
                statusPiece.textContent = 'Doctor:';
            } else if (block.user_type === 'adm') {
                statusPiece.textContent = 'Admin:';
            }

            const namePiece = document.createElement('div');
            namePiece.className = 'name-piece';
            namePiece.textContent = block.first_name;

            const secondNamePiece = document.createElement('div');
            secondNamePiece.className = 'second-name-piece';
            secondNamePiece.textContent = block.last_name;

            statusNameBlock.appendChild(statusPiece);
            statusNameBlock.appendChild(namePiece);
            statusNameBlock.appendChild(secondNamePiece);

            const userIdBlock = document.createElement('div');
            userIdBlock.className = 'user-id-block';

            const userIdHeader = document.createElement('div');
            userIdHeader.className = 'user-id-header';
            userIdHeader.textContent = 'ID:';

            const userIdValue = document.createElement('div');
            userIdValue.className = 'user-id-value';
            userIdValue.textContent = block.user_id;

            userIdBlock.appendChild(userIdHeader);
            userIdBlock.appendChild(userIdValue);

            const delButtonBlock = document.createElement('div');
            delButtonBlock.className = 'del-button-block';

            const delUserButton = document.createElement('button');
            delUserButton.className = 'del-user-button';
            delUserButton.textContent = 'Poista käyttäjä';

            delButtonBlock.appendChild(delUserButton);

            displayBlock.appendChild(statusNameBlock);
            displayBlock.appendChild(userIdBlock);
            displayBlock.appendChild(delButtonBlock);
            
            const blockArea = document.querySelector(blockTarget);
            blockArea.appendChild(displayBlock);
        });
    } else if (blockType === 'doc') {
        let i = 0;
        blocks.forEach((block) => {
            console.log(i);
            console.log(block);
            i++;
            const blockArea = document.querySelector(blockTarget);

            const blockBody = document.createElement('div');
            blockBody.className = 'patient-block';

            const blockHeader = document.createElement('div');
            blockHeader.className = 'patient-block-header';

            const statusNamePiece = document.createElement('div');
            statusNamePiece.className = 'patient-block-header-status-name';

            statusNamePiece.innerHTML = `
                    <div class="patient-block-header-status">Patient:</div>
                    <div class="patient-block-header-name">${block.name} ${block.surname}</div>`;

            const idPiece = document.createElement('div');
            idPiece.className = 'patient-block-header-id';

            idPiece.innerHTML = `
                    <div class="patient-block-header-id-head">ID:</div>
                    <div class="patient-block-header-id-value">${block.id}</div>`;

            blockHeader.appendChild(statusNamePiece);
            blockHeader.appendChild(idPiece);

            const blockHrv = document.createElement('div');
            blockHrv.className = 'patient-block-hrv';
            blockHrv.innerHTML = `
                    <div class="patient-block-hrv-header">HRV:</div>
                    <div class="patient-block-hrv-value">Tähän tulee mittauksia</div>`;

            const blockButtons = document.createElement('div');
            blockButtons.className = 'patient-block-buttons';

            blockButtons.innerHTML = `
                    <div class="patient-block-buttons-part">
                        <button class="patient-block-button">Näytä AI-raportti</button>
                        <button class="patient-block-button">Tautihistoria</button>
                    </div>
                    <div class="patient-block-buttons-part">
                        <button class="patient-block-button">Potilaan mittauskaavio</button>
                        <button class="patient-block-button">Lisää/muokkaa suosituksia</button>
                    </div>
                    
                    `;

            blockBody.appendChild(blockHeader);
            blockBody.appendChild(blockHrv);
            blockBody.appendChild(blockButtons);

            
            blockArea.appendChild(blockBody);
        });
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

    console.log(userData);
    const ageValue = getAge(userData.dateofbirth);

    nameBlock.textContent = `${userData.name} ${userData.surname}`;
    idBlock.textContent = userData.id;
    ageBlock.textContent = `${ageValue} vuotta`;
};

const getAge = (dateString) => {
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
  

export { getUsers, fillUserData, fillPatientData, addEventListenersPatient };