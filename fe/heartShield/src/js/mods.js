import { fetchData } from "./fetch";
import { populateDeviceList } from "./mittari";
import HRVState from "./hrvState";
import { userType, makeModHeader } from "./mech";

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
    closeDialogButton.textContent = '🔙 Close';
    const modBody = document.querySelector('#dia-main-block');
    const modHeader = document.querySelector('#dia-header-value');

    const userLvl = userType();

    if (number === 1) {
        makeModHeader('🧠 HRV-Kaavio');
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
            <div class="hrv-kaavio-row-header">PNN50:</div>
            <div class="hrv-kaavio-row-graph">
                <div class="kaavio-graph" id="hrv-kaavio-graph-pnn50"></div>
            </div>
            <div class="hrv-kaavio-row-value" id="hrv-kaavio-pnn50-value">-</div>
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
        const pnn50Value = document.querySelector('#hrv-kaavio-pnn50-value');
        const lfhfValue = document.querySelector('#hrv-kaavio-lfhf-value');

        // 📢 Подписка на изменения HRVState
        unsubscribe = HRVState.subscribe((state) => {
            console.log(state);

            const kanssi = {
                sdnn: null,
                rmssd: null,
                pnn50: null,
                lf_hf: null,
            };

            const { sdnn, rmssd, pnn50, lf_hf } = state.rrMetrics !== null? state.rrMetrics : kanssi;  // Получаем актуальные данные из состояния

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

            if (pnn50 !== null) {
                pnn50Value.textContent = `${pnn50}`;
                updateGraph('hrv-kaavio-graph-pnn50', pnn50, 0, 100); // аналогично
            }
        
            if (lf_hf !== null) {
                lfhfValue.textContent = `${lf_hf}`;
                updateGraph('hrv-kaavio-graph-lfhf', lf_hf, 0, 5); // допустим LF/HF от 0 до 5
            }
        });
    } else if (number === 2) {
        modBody.textContent = '';
    } else if (number === 3) {
        makeModHeader('🔌 Mittari');
        modBody.innerHTML = `
        <div id="dia-mittari-header">
            <div id="dia-mittari-header-left">
                <div id="dia-mittari-status-block">
                    <div>Tilanne:</div>
                    <div id="dia-mittari-status">🔴 Disconnected</div>
                </div>
            </div>
            <div id="dia-mittari-header-right">
                <button id="dia-find-mittari">🔍 Etsi</button>
            </div>
        </div>
        `;

        populateDeviceList();

    } else if (number === 4) {
        modBody.textContent = '';
    } else if (number === 5) {
        modBody.innerHTML = `
        <div class="mod5" id="mod5">
            <div class="sign-block">❗</div>
            <div class="mod5-body">
                <div class="mod5-body-header">Valitse oire(ta)</div>
                <div class="mod5-body-body">
                    <div class="mod12-row">
                        <div class="mod5-oire">
                            <input type="checkbox" />
                            <div class="mod5-oire-header">Rintakipu</div>
                        </div>
                        <div class="mod5-oire">
                            <input type="checkbox" />
                            <div class="mod5-oire-header">Huimaus</div>
                        </div>
                    </div>
                    <div class="mod12-row">
                        <div class="mod5-oire">
                            <input type="checkbox" />
                            <div class="mod5-oire-header">Hengitysvaikeudet</div>
                        </div>
                        <div class="mod5-oire">
                            <input type="checkbox" />
                            <div class="mod5-oire-header">Nopeutunut syke</div>
                        </div>
                    </div>
                    <div class="mod12-row">
                        <div class="mod5-oiretext">
                            <input type="textarea" id="mod5-oire-text" />
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
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
        modHeader.innerHTML = `
        <div class="sign-block">🔴</div>
        <div class="mod7-dia-header">HÄTÄTILANNE - POTILAS KRIITTISESSÄ TILASSA</div>`;
        modHeader.style.color = 'white';

        modBody.innerHTML = `
        <div id="alarm-id"></div>
        <div id="alarm-dia-main-info">
            <div class="alarm-dia-main-header">Potilas:</div>
            <div class="alarm-dia-main-name" id="alarm-dia-main-name"></div>
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
                <div id="mod7-pot-answer"></div>
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
            <div class="sign-block">📅</div>
            <div class="header-block">Date:</div>
            <div class="data-block" id="mod8-date-value"></div>
        </div>
        <div class="mod8-row">
            <div class="sign-block">⚠️</div>
            <div class="header-block">Risk:</div>
            <div class="data-block" id="mod8-risk-value"></div>
        </div>
        <div class="mod8-row">
            <div class="sign-block">📄</div>
            <div class="header-block">For pat:</div>
            <div class="data-block" id="mod8-pat-value"></div>
        </div>
        <div class="mod8-row">
            <div class="sign-block">📋</div>
            <div class="header-block">For doc:</div>
            <div class="data-block" id="mod8-doc-value"></div>
        </div>`;
    } else if (number === 9) {
        modHeader.innerHTML = `
        <div class="sign-block">📖</div>
        <div class="doc-but-dia-header">
            <div class="doc-but-header-part">Tautihistoria</div>
            <div class="doc-but-header-part">
                <div class="but-header-part-part">Potilas:</div>
                <div class="but-header-part-part" id="but-header-part-name"></div>
                <div class="but-header-part-part" id="but-header-part-surname"></div>
            </div>
        </div>`;
        modBody.innerHTML = `
        <div class="mod12-table">
            <div class="mod12-row">
                <div class="sign-block">📅</div>
                <div class="mod12-row-header">Infarkti:</div>
                <div class="mod12-row-value" id="mod9-mi-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">🔍</div>
                <div class="mod12-row-header">HRV-seuranta aloitettu:</div>
                <div class="mod12-row-value" id="mod9-reg-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">💊</div>
                <div class="mod12-row-header">Lääkitys:</div>
                <div class="mod12-row-value" id="mod9-pills-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">📄</div>
                <div class="mod12-row-header">Edelliset AI-raportit:</div>
                <div class="mod12-row-value" id="mod9-ai-value"></div>
            </div>
        </div>`;
    } else if (number === 10) {
        modHeader.innerHTML = `
        <div class="sign-block">📈</div>
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
        modHeader.innerHTML = `
        <div class="sign-block">✍️</div>
        <div class="doc-but-dia-header">
            <div class="doc-but-header-part">Muokkaa suosituksia</div>
            <div class="doc-but-header-part">
                <div class="but-header-part-part">Potilas:</div>
                <div class="but-header-part-part" id="but-header-part-name"></div>
                <div class="but-header-part-part" id="but-header-part-surname"></div>
            </div>
        </div>`;
        modBody.innerHTML = `
        <div class="mod11-suositus-block">
            <div class="sign-block">📄</div>
            <div class="mod11-data-part">
                <div class="mod11-row-header">Nykyinen hoitosuositus:</div>
                <div class="mod11-value-row" id="mod11-last-suositus">Suositus</div>
            </div>
        </div>
        <div class="mod11-suositus-block">
            <div class="sign-block">📝</div>
            <div class="mod11-data-part">
                <div class="mod11-row-header">Uusi suositus:</div>
                <div class="mod11-value-row">
                    <input id="mod11-new-suositus">
                </div>
            </div>
        </div>`;
    } else if (number === 12) {
        
        userLvl === 'doc'
            ? makeModHeader('➕ Create new patient')
            : makeModHeader('➕ Create new user');
        
        modBody.innerHTML = `
        <div class="mod12-table">
            <div class="mod12-row">
                <div class="sign-block">👤</div>
                <div class="mod12-row-header">Etunimi:</div>
                <input type="text" class="mod12-row-input" id="new-pot-name" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">👥</div>
                <div class="mod12-row-header">Sukunimi:</div>
                <input type="text" class="mod12-row-input" id="new-pot-surname" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">🎂</div>
                <div class="mod12-row-header">Syntymäaika:</div>
                <input type="date" class="mod12-row-input" id="new-pot-dob" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">🆔</div>
                <div class="mod12-row-header">Henkilötunnus:</div>
                <input type="text" class="mod12-row-input" id="new-pot-ht" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">📞</div>
                <div class="mod12-row-header">Puhelinnumero:</div>
                <input type="text" class="mod12-row-input" id="new-pot-phone" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">📧</div>
                <div class="mod12-row-header">Sähköposti:</div>
                <input type="text" class="mod12-row-input" id="new-pot-mail" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">🔒</div>
                <div class="mod12-row-header">Salasana:</div>
                <input type="text" class="mod12-row-input" id="new-pot-pass" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">🔐</div>
                <div class="mod12-row-header">Vahvista salasana:</div>
                <input type="text" class="mod12-row-input" id="new-pot-passconf" required />
                <div class="sign-block">*</div>
            </div>
        </div>
        `;

        if (userLvl === 'adm') {
            const userStatus = document.createElement('div');
            userStatus.className = 'mod12-row';

            userStatus.innerHTML = `
            <div class="sign-block">⚙️</div>
            <div class="mod12-row-header">User type:</div>
            <select class="mod12-row-input" id="new-pot-type" required>
                <option value="">-- Valitse --</option>
                <option value="adm">adm</option>
                <option value="doc">doc</option>
            </select>
            <div class="sign-block">*</div>`;
            modBody.appendChild(userStatus);
        }
    } else if (number === 13) {
        console.log('MOD 13');
    } else if (number === 14) {
        modHeader.innerHTML = `<div>➕ Create new patient</div>`;
        modBody.innerHTML = `
        <div class="mod12-table">
            <div class="mod12-row">
                <div class="sign-block">🗓️</div>
                <div class="mod12-row-header">MI date:</div>
                <input type="date" class="mod12-row-input" id="new-pot-mi" required />
                <div class="sign-block">*</div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">💊</div>
                <div class="mod12-row-header">Lääkkeet:</div>
                <input type="text" class="mod12-row-input" id="new-pot-drugs" />
                <div class="sign-block">*</div>
            </div>
        </div>
        `;
    } else if (number === 15) {
        modBody.innerHTML = `<div>User successfully created</div>`;
    } else if (number === 16) {
        console.log('MOD 16');
    } else if (number === 17) {
        console.log('MOD 17');
        makeModHeader('❌ Delete patient');
        modBody.innerHTML = `
        <div class="mod12-row">
            <div class="sign-block">🆔</div>
            <div class="mod12-row-header">Patient ID:</div>
            <input type="text" class="mod12-row-input" id="delete-pot-id" required />
            <div class="sign-block">*</div>
        </div>`;
    } else if (number === 18) {
        console.log('mod18');
        makeModHeader('🔍 Find user');
        modBody.innerHTML = `
        <div class="mod12-row">
            <div class="sign-block">👤</div>
            <div class="mod12-row-header">User ID:</div>
            <input type="text" class="mod12-row-input" id="search-user-adm" />
        </div>`;
    } else if (number === 19) {
        console.log('MOD19');
        makeModHeader('🔍 Find user');
        modBody.innerHTML = `
        <div class="mod19-body-header">
            <div class="mod19-id-block">
                <div class="mod19-header-block">ID:</div>
                <div class="mod19-value-block" id="mod19-id-value"></div>
            </div>
            <div class="mod19-type-block">
                <div class="mod19-header-block">type:</div>
                <div class="mod19-value-block" id="mod19-type-value"></div>
            </div>
        </div>
        <div class="mod19-body-body">
            <div class="mod12-row">
                <div class="sign-block">👤</div>
                <div class="mod12-row-header">name:</div>
                <div class="mod12-row-value" id="mod19-name-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">📧</div>
                <div class="mod12-row-header">email:</div>
                <div class="mod12-row-value" id="mod19-email-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">📞</div>
                <div class="mod12-row-header">phone:</div>
                <div class="mod12-row-value" id="mod19-phone-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">🎂</div>
                <div class="mod12-row-header">date of birth:</div>
                <div class="mod12-row-value" id="mod19-dob-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">🗓️</div>
                <div class="mod12-row-header">date of reg:</div>
                <div class="mod12-row-value" id="mod19-dor-value"></div>
            </div>
            <div class="mod12-row">
                <div class="sign-block">📋</div>
                <div class="mod12-row-header">henkilotunnus:</div>
                <div class="mod12-row-value" id="mod19-ht-value"></div>
            </div>
        </div>`;
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
