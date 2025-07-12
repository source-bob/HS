import  { createMod } from './mods';


const createButton = async (butID, butClass, butText, butListener) => {
    const newButton = document.createElement('button');
    newButton.id = butID;
    newButton.className = butClass;
    newButton.textContent = butText;
    newButton.addEventListener('click', butListener);

    return newButton;
};

const showMessageModal = async (message = 'Mistake ', header) => {
    createMod(16);

    const modWindow = document.querySelector('#main-dialog');
    const diaHeader = await selectBlock('dia-header-value');
    const diaBody = await selectBlock('dia-body');
    const modBody = await selectBlock('dia-main-block');

    diaHeader.innerHTML = `${header}`;
    modBody.innerHTML = `<div>${message}</div>`;
};

const createRow12 = async () => {};

const selectBlock = async (blockID) => document.querySelector(`#${blockID}`);

const showErrorModal = async (callback, message = 'Mistake ', header) => {
    createMod(13);

    const diaHeader = await selectBlock('dia-header-value');
    const diaBody = await selectBlock('dia-body');
    const modBody = await selectBlock('dia-main-block');

    diaHeader.innerHTML = `${header}`;
    modBody.innerHTML = `<div>${message}</div>`;
    const okButton = await createButton('ok-back-button', 'dia-control-button', 'oki', callback);
    diaBody.appendChild(okButton);
};

const getVal = (id) => document.querySelector(`#${id}`)?.value.trim();

const userType = () => localStorage.getItem('user_type');
const userID = () => parseInt(localStorage.getItem('user_id'));

function makeModHeader(header) {
    const modHeader = document.querySelector('#dia-header-value');
    modHeader.innerHTML = `<div>${header}</div>`;
    return;
};

export { createButton, selectBlock, getVal, showErrorModal, userType, makeModHeader, userID, showMessageModal };