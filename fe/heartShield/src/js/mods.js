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

export { createMessage, createMod };