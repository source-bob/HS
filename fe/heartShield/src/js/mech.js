import  { createMod } from './mods';


const createButton = async (butID, butClass, butText, butListener) => {
    const newButton = document.createElement('button');
    newButton.id = butID;
    newButton.className = butClass;
    newButton.textContent = butText;
    newButton.addEventListener('click', butListener);

    return newButton;
};

const createEmptyBlocks = async (blockValues) => {
    const emptyBlocks = [];
    if (blockValues.length === 0) {
        return false;
    } else {
        for (let i = 0; i < blockValues.length; i++) {
            const block = await selectBlock(blockValues[i]);
            emptyBlocks.push(block);
        }
        return emptyBlocks;
    }
};

const fillBlocks = async (blocks, values) => {
    if (blocks.length !== values.length) {
        console.log('LENGTH:', blocks.length, values.length);
        console.log(blocks);
        console.log(values);
        return false;
    } else {
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].textContent = values[i];
        }
        return true;
    }
};

const showMessageModal = async (message = 'Mistake ', header, colors = 1) => {
    createMod(16);

    const modWindow = document.querySelector('#main-dialog');
    const diaHeader = await selectBlock('dia-header-value');
    const diaBody = await selectBlock('dia-body');
    const modBody = await selectBlock('dia-main-block');

    if (colors === 1) {
        modColor(1);
    } else if (colors === 2) {
        modColor(2);
    }

    diaHeader.innerHTML = `${header}`;
    modBody.innerHTML = `<div>${message}</div>`;
};

const createRow12 = async () => {};

const createShadowBlock = () => {
    const shadowBlock = document.createElement('div');
    shadowBlock.id = 'window-shadow';

    const docBody = document.querySelector('body');
    docBody.appendChild(shadowBlock);
    return true;
};

const createShadow = async (switchShadow) => {
    const shadowBlock = await selectBlock('window-shadow');
    if (switchShadow === 1) {
        shadowBlock.style.display = 'block';
    } else if (switchShadow === 2) {
        shadowBlock.style.display = 'none';
    }
};

const selectBlock = async (blockID) => document.querySelector(`#${blockID}`);

const showErrorModal = async (callback, message = 'Mistake ', header, colors = 1) => {
    createMod(13);

    const diaHeader = await selectBlock('dia-header-value');
    const diaBody = await selectBlock('dia-body');
    const modBody = await selectBlock('dia-main-block');

    if (colors === 1) {
        modColor(1);
    } else if (colors === 2) {
        modColor(2);
    }

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

const modColor = async (num) => {
    const modBody = await selectBlock('dia-main-block');
    const diaBody = await selectBlock('dia-body');
    const diaHeader = await selectBlock('dia-header');


    if (num === 1) {
        modBody.style.backgroundColor = 'white';
        diaBody.style.backgroundColor = 'white';
        diaBody.style.color = 'black';
    } else if (num === 2) {
        diaBody.style.backgroundColor = '#880015'
        modBody.style.backgroundColor = 'white';
        diaHeader.style.color = 'white';
    } else if (num === 3) {
        diaBody.style.backgroundColor = 'black';
        diaHeader.style.color = 'white';
        modBody.style.backgroundColor = 'white';
    }
};

export {
    fillBlocks,
    createEmptyBlocks,
    createShadowBlock,
    createShadow,
    modColor,
    createButton,
    selectBlock,
    getVal,
    showErrorModal,
    userType,
    makeModHeader,
    userID,
    showMessageModal
};