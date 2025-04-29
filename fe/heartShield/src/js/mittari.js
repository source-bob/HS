import { debugMovesenseCharacteristics } from "./debugBLE";
import HRVState from './hrvState.js';

let connectedDevice = null;
let connectedServer = null;

async function scanAvailableDevices() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'Movesense' }],
            optionalServices: ['heart_rate', '0000fdf3-0000-1000-8000-00805f9b34fb']
        });

        const server = await device.gatt.connect();

        // 💾 Сохраняем подключение
        connectedDevice = device;
        connectedServer = server;

        device.addEventListener('gattserverdisconnected', () => {
            console.warn('🔌 Laite irrotettu (Device disconnected)');
        });

        // 🚀 Запускаем слушателя данных
        await startHRVDataListener(server);

        return [{
            name: device.name || 'Tuntematon laite',
            id: device.id,
            connected: true,
            device,
            server
        }];
    } catch (error) {
        console.error('Bluetooth-selaus epäonnistui:', error);
        return [];
    }
};

async function populateDeviceList() {
    const buttonFind = document.querySelector('#dia-find-mittari');

    buttonFind.addEventListener('click', async () => {
        const devices = await scanAvailableDevices();

        if (devices[0].connected) {
            const deviceStatus = document.querySelector('#dia-mittari-status');
            const mainDeviceStatus = document.querySelector('#patient-info-mittari-value');
            mainDeviceStatus.textContent = 'Connected';
            deviceStatus.textContent = 'Connected';
        }
    });
};

async function startHRVDataListener(server) {
    try {
        const hrService = await server.getPrimaryService('heart_rate');
        const hrChar = await hrService.getCharacteristic('heart_rate_measurement');

        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', (event) => {
            const data = parseHeartRateWithRR(event.target.value);
            console.log(`❤️ Syke (Heart Rate): ${data.heartRate} bpm`);

            HRVState.setHeartRate(data.heartRate); // <-- вместо прямой записи на страницу

            if (data.rrIntervals.length > 0) {
                console.log(`⏱ RR-intervallit (ms):`, data.rrIntervals);

                const metrics = updateRRMetrics(data.rrIntervals);

                if (metrics) {
                    const hrvStatus = classifyHRV(metrics.sdnn);
                    console.log(`📊 HRV-metriikat: SDNN=${metrics.sdnn}, RMSSD=${metrics.rmssd}, pNN50=${metrics.pnn50}%`);
                    console.log('🧬 HRV-tulkinta:', hrvStatus);

                    HRVState.setRRMetrics(metrics); // <-- обновляем метрики
                    HRVState.setHRVStatus(hrvStatus); // <-- и статус HRV
                }
            } else {
                console.log('RR-intervallit eivät ole saatavilla');
            }
        });

        // 🧪 Подключение других характеристик (Movesense)
        const msService = await server.getPrimaryService('0000fdf3-0000-1000-8000-00805f9b34fb');

        const char1 = await msService.getCharacteristic('6b200001-ff4e-4979-8186-fb7ba486fcd7');
        const char2 = await msService.getCharacteristic('6b200002-ff4e-4979-8186-fb7ba486fcd7');

        await char1.startNotifications();
        char1.addEventListener('characteristicvaluechanged', (e) => {
            console.log('🔔 Char 1:', new Uint8Array(e.target.value.buffer));
        });

        await char2.startNotifications();
        char2.addEventListener('characteristicvaluechanged', (e) => {
            console.log('🔔 Char 2:', new Uint8Array(e.target.value.buffer));
        });

    } catch (err) {
        console.error('Virhe HRV-tiedon käsittelyssä:', err);
    }
};

function classifyHRV(sdnn) {
    if (sdnn < 50) return "Alhainen HRV (riski)";
    if (sdnn < 100) return "Normaali HRV";
    return "Korkea HRV (erinomainen)";
};

function parseHeartRateWithRR(dataView) {
    const flags = dataView.getUint8(0);
    const hrFormat16Bit = flags & 0x01;
    const rrIntervalFlag = flags & 0x10;

    // Считываем пульс
    let heartRate;
    let offset = 1;
    if (hrFormat16Bit) {
        heartRate = dataView.getUint16(offset, true);
        offset += 2;
    } else {
        heartRate = dataView.getUint8(offset);
        offset += 1;
    }

    // Считываем RR-интервалы, если они есть
    const rrIntervals = [];
    if (rrIntervalFlag) {
        while (offset + 1 < dataView.byteLength) {
            const rr = dataView.getUint16(offset, true);
            rrIntervals.push(rr); // в миллисекундах
            offset += 2;
        }
    }

    return { heartRate, rrIntervals };
};

const rrBuffer = [];

function updateRRMetrics(newRRs) {
    // Добавляем новые RR-интервалы
    rrBuffer.push(...newRRs);

    // Ограничиваем буфер до последних 300 интервалов
    while (rrBuffer.length > 300) {
        rrBuffer.shift();
    }

    console.log('BUFER:', rrBuffer);

    if (rrBuffer.length < 3) return null; // Недостаточно данных

    // 🔹 SDNN: стандартное отклонение всех RR
    const mean = rrBuffer.reduce((a, b) => a + b, 0) / rrBuffer.length;
    const sdnn = Math.sqrt(
        rrBuffer.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / rrBuffer.length
    );

    // 🔹 RMSSD: корень из среднего квадрата разностей
    let rmssd = 0;
    for (let i = 1; i < rrBuffer.length; i++) {
        const diff = rrBuffer[i] - rrBuffer[i - 1];
        rmssd += diff * diff;
    }
    rmssd = Math.sqrt(rmssd / (rrBuffer.length - 1));

    // 🔹 pNN50
    const nn50 = rrBuffer.filter((val, i, arr) => i > 0 && Math.abs(val - arr[i - 1]) > 50).length;
    const pnn50 = (nn50 / (rrBuffer.length - 1)) * 100;

    const lfHfRatio = calculateLFHFRatio(rrBuffer);

    // где-то можно показать его в консоли
    if (lfHfRatio) {
        console.log(`⚡ LF/HF-соотношение: ${lfHfRatio}`);
    }

    return { sdnn: Math.round(sdnn), rmssd: Math.round(rmssd), pnn50: Math.round(pnn50), lfhf: lfHfRatio };
};

function calculateLFHFRatio(rrIntervals) {
    if (rrIntervals.length < 8) return null; // слишком мало точек

    // 1. Нормализуем интервалы (в секундах)
    const rrSec = rrIntervals.map(rr => rr / 1000);  // перевести миллисекунды в секунды

    // 2. Создаем временные точки
    const timestamps = [];
    let t = 0;
    for (let i = 0; i < rrSec.length; i++) {
        t += rrSec[i];
        timestamps.push(t);
    }

    // 3. Интерполяция данных на равномерную сетку (например, 4 Гц)
    const fs = 4; // частота дискретизации
    const dt = 1 / fs;
    const uniformTimes = [];
    for (let i = 0; i < timestamps[timestamps.length - 1]; i += dt) {
        uniformTimes.push(i);
    }

    // Линейная интерполяция RR-данных
    const interpolated = uniformTimes.map(t => {
        for (let i = 1; i < timestamps.length; i++) {
            if (timestamps[i] >= t) {
                const t1 = timestamps[i - 1];
                const t2 = timestamps[i];
                const rr1 = rrSec[i - 1];
                const rr2 = rrSec[i];
                const alpha = (t - t1) / (t2 - t1);
                return rr1 + alpha * (rr2 - rr1);
            }
        }
        return rrSec[rrSec.length - 1];
    });

    // 4. Быстрое преобразование Фурье (очень базовое)
    const N = interpolated.length;
    const re = new Array(N).fill(0);
    const im = new Array(N).fill(0);

    for (let k = 0; k < N; k++) {
        for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            re[k] += interpolated[n] * Math.cos(-angle);
            im[k] += interpolated[n] * Math.sin(-angle);
        }
    }

    const powers = re.map((r, i) => r * r + im[i] * im[i]);

    // 5. Определение полос энергии
    const freqs = [];
    for (let i = 0; i < N; i++) {
        freqs.push(i * fs / N);
    }

    let lfPower = 0;
    let hfPower = 0;

    for (let i = 0; i < freqs.length; i++) {
        if (freqs[i] >= 0.04 && freqs[i] <= 0.15) {
            lfPower += powers[i];
        }
        if (freqs[i] >= 0.15 && freqs[i] <= 0.4) {
            hfPower += powers[i];
        }
    }

    if (hfPower === 0) return null;

    const lfHfRatio = lfPower / hfPower;

    return lfHfRatio.toFixed(2); // округляем до 2 знаков
};


export { populateDeviceList };
