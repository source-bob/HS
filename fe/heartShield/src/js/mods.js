import { fetchData } from "./fetch";
import { populateDeviceList } from "./mittari";
import HRVState from "./hrvState";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fi-FI', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).replace(',', '');
};

const createMessage = async (message) => {
    
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message-login';
    errorMessage.textContent = message;
    const errorCloseButton = document.createElement('div');
    errorCloseButton.id = 'error-close';
    errorCloseButton.textContent = 'ok';

    errorCloseButton.addEventListener('click', () => {
        errorMessage.style.display = 'none';
    });

    errorMessage.appendChild(errorCloseButton);
    return errorMessage;
};

const createMod = async (number) => {
    
    const diaBody = document.querySelector('#dia-body');
    refreshDia(diaBody);
    let unsubscribe;

    const modWindow = document.querySelector('#main-dialog');
    const closeDialogButton = document.querySelector('#close-dialog-button');
    const modBody = document.querySelector('#dia-main-block');
    const modHeader = document.querySelector('#dia-header-value');

    if (number === 1) {
        modHeader.textContent = 'HRV-Kaavio';
        modBody.innerHTML = `
        <div class="hrv-kaavio-row">
            <div class="hrv-kaavio-row-header">RMSSD (ms):</div>
            <div class="hrv-kaavio-row-graph">
                <div class="kaavio-graph" id="hrv-kaavio-graph-rmssd"></div>
            </div>
            <div class="hrv-kaavio-row-value" id="hrv-kaavio-rmssd-value">-</div>
        </div>
        <div class="hrv-kaavio-row">
            <div class="hrv-kaavio-row-header">SDNN (ms):</div>
            <div class="hrv-kaavio-row-graph">
                <div class="kaavio-graph" id="hrv-kaavio-graph-sdnn"></div>
            </div>
            <div class="hrv-kaavio-row-value" id="hrv-kaavio-sdnn-value">-</div>
        </div>
        <div class="hrv-kaavio-row">
            <div class="hrv-kaavio-row-header">LF/HF-suhde:</div>
            <div class="hrv-kaavio-row-graph">
                <div class="kaavio-graph" id="hrv-kaavio-graph-lfhf"></div>
            </div>
            <div class="hrv-kaavio-row-value" id="hrv-kaavio-lfhf-value">-</div>
        </div>
        `;

        const rmssdValue = document.querySelector('#hrv-kaavio-rmssd-value');
        const sdnnValue = document.querySelector('#hrv-kaavio-sdnn-value');
        const lfhfValue = document.querySelector('#hrv-kaavio-lfhf-value');

        // 📢 Подписка на изменения HRVState
        unsubscribe = HRVState.subscribe((state) => {
            console.log(state);

            const kanssi = {
                sdnn: null,
                rmssd: null,
                pnn50: null,
                lfhf: null,
            };

            const { sdnn, rmssd, pnn50, lfhf } = state.rrMetrics !== null? state.rrMetrics : kanssi;  // Получаем актуальные данные из состояния

            // Обновляем значения в UI
            if (rmssd !== null) {
                console.log('RMSSD not null');
                rmssdValue.textContent = `${rmssd}`;
                updateGraph('hrv-kaavio-graph-rmssd', rmssd, 0, 150); // где 150 — максимальное ожидаемое значение RMSSD
            }
        
            if (sdnn !== null) {
                sdnnValue.textContent = `${sdnn}`;
                updateGraph('hrv-kaavio-graph-sdnn', sdnn, 0, 150); // аналогично
            }
        
            if (lfhf !== null) {
                lfhfValue.textContent = `${lfhf}`;
                updateGraph('hrv-kaavio-graph-lfhf', lfhf, 0, 5); // допустим LF/HF от 0 до 5
            }
        });
    } else if (number === 2) {
        modBody.textContent = 'second';
    } else if (number === 3) {
        modHeader.textContent = 'Mittari';
        modBody.innerHTML = `
        <div id="dia-mittari-header">
            <div id="dia-mittari-header-left">
                <div id="dia-mittari-status-block">
                    <div>Tilanne:</div>
                    <div id="dia-mittari-status">Disconnected</div>
                </div>
            </div>
            <div id="dia-mittari-header-right">
                <button id="dia-find-mittari">Etsi</button>
            </div>
        </div>
        `;

        populateDeviceList();

    } else if (number === 4) {
        modBody.textContent = 'fourth';
    } else if (number === 5) {
        modBody.textContent = 'fith';
    } else if (number === 6) {
        console.log('mod 6');

        modHeader.textContent = 'VAROITUS - SYDÄMEN TOIMINTA POIKKEAA NORMISTA';
        modHeader.style.color = 'white';
        diaBody.style.backgroundColor = '#880015';
        closeDialogButton.style.display = 'none';
        modBody.innerHTML = `
        <div class="alarm-block-dia">
            <div class="alarm-symb-block">1</div>
            <div class="alarm-text-block">Mittaustesi perusteella sydämen rytmissä on havaittu kriittinen poikkeama.</div>
        </div>
        <div class="alarm-block-dia">
            <div class="alarm-symb-block">2</div>
            <div class="alarm-text-block">Vahvista tilasi painamalla alla olevaa painiketta 60 sekunnin kuluessa.</div>
        </div>
        <div class="alarm-block-dia">
            <div class="alarm-symb-block">3</div>
            <div class="alarm-text-block">Ellet vastaa ajoissa, järjestelmä hälyttää automaattisesti ensihoidon paikalle.</div>
        </div>
        <div id="alarm-button-div">
            <button id="alarm-dia-button">Olen kunnossa</button>
        </div>
        `;
        modBody.style.display = 'flex';
        modBody.style.flexDirection = 'column';
    } else if (number === 7) {
        diaBody.style.backgroundColor = '#880015';
        modHeader.textContent = '🔴 HÄTÄTILANNE - POTILAS KRIITTISESSÄ TILASSA';
        modHeader.style.color = 'white';

        modBody.innerHTML = `
        <div id="alarm-id"></div>
        <div id="alarm-dia-main-info">
            <div class="alarm-dia-main-header">Potilas:</div>
            <div class="alarm-dia-main-name"></div>
        </div>
        <div id="alarm-dia-add-info">
            <div class="alarm-dia-add-part">
                <div class="alarm-dia-metrics">
                    <div class="sign-block">📉</div>
                    <div class="alarm-dia-add-metric">
                        <div class="alarm-dia-metric-header">RMSSD:</div>
                        <div class="alarm-dia-metric-value" id="alarm-dia-metric-rmssd"></div>
                    </div>
                    <div class="sign-block">|</div>
                    <div class="alarm-dia-add-metric">
                        <div class="alarm-dia-metric-header"> SDNN:</div>
                        <div class="alarm-dia-metric-value" id="alarm-dia-metric-sdnn"></div>
                    </div>
                </div>
            </div>
            <div class="alarm-dia-add-part">
                <div class="sign-block">🔍</div>
                <div id="alarm-dia-pat-ai"></div>
            </div>
            <div class="alarm-dia-add-part">
                <div class="sign-block">❗</div>
                <div id="alarm-dia-doc-ai"></div>
            </div>
            <div class="alarm-dia-add-part">
                <div class="sign-block">⏱️</div>
                <div>Potilas ei vastanut ilmoitukseen.</div>
            </div>
        </div>
        `;

        
        console.log('mod 7');
    } else if (number === 8) {
        modHeader.innerHTML = `
        <div class="sign-block">🤖</div>
        <div class="doc-but-dia-header">
            <div class="doc-but-header-part">AI-raportti</div>
            <div class="doc-but-header-part">
                <div class="but-header-part-part">Potilas:</div>
                <div class="but-header-part-part" id="but-header-part-name">John</div>
                <div class="but-header-part-part" id="but-header-part-surname">Nash</div>
            </div>
        </div>`;
        modBody.innerHTML = `
        <div class="mod8-row">
            <div class="sign-block">X</div>
            <div class="header-block">Risk:</div>
            <div class="data-block" id="mod8-risk-value"></div>
        </div>
        <div class="mod8-row">
            <div class="sign-block">X</div>
            <div class="header-block">For pat:</div>
            <div class="data-block" id="mod8-pat-value"></div>
        </div>
        <div class="mod8-row">
            <div class="sign-block">X</div>
            <div class="header-block">For doc:</div>
            <div class="data-block" id="mod8-doc-value"></div>
        </div>`;
    } else if (number === 9) {
        modBody.textContent = 'MOD 9';
    } else if (number === 10) {
        modHeader.innerHTML = `
        <div class="sign-block">📊</div>
        <div class="doc-but-dia-header">
            <div class="doc-but-header-part">Mittauskaavio — HRV-trendi</div>
            <div class="doc-but-header-part">
                <div class="but-header-part-part">Potilas:</div>
                <div class="but-header-part-part" id="but-header-part-name">John</div>
                <div class="but-header-part-part" id="but-header-part-surname">Nash</div>
            </div>
        </div>`;
        modBody.innerHTML = `
        <div class="mod10-date">DATE</div>
        <div class="mod10-table">
            <div class="mod10-table-half">
                <div class="mod10-table-column">
                    <div class="mod10-table-column-header">hr:</div>
                    <div class="mod10-table-column-header">sdnn:</div>
                    <div class="mod10-table-column-header">rmssd:</div>
                </div>
                <div class="mod10-table-column">
                    <div class="mod10-table-column-value" id="mod10-table-cell-hr"></div>
                    <div class="mod10-table-column-value" id="mod10-table-cell-sdnn"></div>
                    <div class="mod10-table-column-value" id="mod10-table-cell-rmssd"></div>
                </div>
            </div>
            <div class="mod10-table-half">
                <div class="mod10-table-column">
                    <div class="mod10-table-column-header">pnn50:</div>
                    <div class="mod10-table-column-header">lf-hf:</div>
                    <div class="mod10-table-column-header">rr-mean:</div>
                </div>
                <div class="mod10-table-column">
                    <div class="mod10-table-column-value" id="mod10-table-cell-pnn50"></div>
                    <div class="mod10-table-column-value" id="mod10-table-cell-lfhf"></div>
                    <div class="mod10-table-column-value" id="mod10-table-cell-rrmean"></div>
                </div>
            </div>
        </div>`;
    } else if (number === 11) {
        modBody.textContent = 'MOD 11';
    }

    closeDialogButton.addEventListener('click', () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        modWindow.close();
    });
    modWindow.showModal();
};

function updateGraph(elementId, value, minValue, maxValue) {
    const graphElement = document.querySelector(`#${elementId}`);
    if (!graphElement) return;
    
    // Нормализуем значение в диапазоне 0-100%
    const normalizedValue = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));

    console.log('updating graph', normalizedValue, elementId, graphElement);

    graphElement.style.width = `${normalizedValue}%`;
};

function refreshDia (body) {
    body.innerHTML = `
    <div id="dia-header">
        <div id="dia-header-value"></div>
        <button id="close-dialog-button">Close</button>
    </div>
    <div id="dia-main-block"></div>`;
};



export { createMessage, createMod, formatDate };
