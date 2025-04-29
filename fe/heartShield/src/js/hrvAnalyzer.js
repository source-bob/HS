import HRVState from './hrvState.js';

let lastSaveTimestamp = 0;
const SAVE_INTERVAL_MS = 60 * 60 * 1000; // 1 час

async function monitorHRVStatus() {
    setInterval(async () => {
        const currentStatus = HRVState.getHRVStatus();
        const currentMetrics = HRVState.getRRMetrics();

        if (!currentStatus || !currentMetrics) {
            console.warn('Нет данных для анализа HRV.');
            return;
        }

        const now = Date.now();

        if (currentStatus === "Normaali HRV") {
            if (now - lastSaveTimestamp >= SAVE_INTERVAL_MS) {
                await saveMetricsToDatabase(currentMetrics);
                lastSaveTimestamp = now;
            }
        } else {
            await sendMetricsToAI(currentMetrics, currentStatus);
        }
    }, 5000); // проверяем каждые 5 секунд
};

async function saveMetricsToDatabase(metrics) {
    // Здесь заглушка вместо реальной базы
    console.log('💾 Сохраняем метрики в базу данных:', metrics);
    // TODO: Здесь можно подключить IndexedDB или API сервера
}

async function sendMetricsToAI(metrics, status) {
    const prompt = generatePrompt(metrics, status);

    try {
        const response = await fetch('https://your-ai-endpoint.com/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                metrics: metrics
            })
        });

        const data = await response.json();
        console.log('🧠 Ответ ИИ:', data);

        // TODO: Обработать ответ ИИ позже
    } catch (error) {
        console.error('Ошибка при отправке метрик ИИ:', error);
    }
}

function generatePrompt(metrics, status) {
    return `
Проведи медицинский анализ следующих метрик HRV:

- Статус HRV: ${status}
- SDNN: ${metrics.sdnn} мс
- RMSSD: ${metrics.rmssd} мс
- pNN50: ${metrics.pnn50}%
- LF/HF: ${metrics.lfhf}

Проанализируй отклонения от нормы и предложи рекомендации в короткой форме (1-2 абзаца).
`;
}

export { monitorHRVStatus };
