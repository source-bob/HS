import promisePool from "../utils/database.js";
import 'dotenv/config';
import OpenAI from "openai";
import { getLastMeasures } from "./metric-model.js";



const makeResearch = async (userData) => {
  console.log('SEND METRICS TO AI, STEP 3', userData);
  const { user_id, metrics, userAge, hr, measureDate } = userData;

  const intUserId = parseInt(user_id);
  const lastMeasures = await getLastMeasures(intUserId, 2);

  const prompt = createPrompt(metrics, userAge, hr, lastMeasures, measureDate);

  const client = new OpenAI({
    baseURL: 'https://router.huggingface.co/hyperbolic/v1',
    apiKey: process.env.HF_TOKEN, // Используй переменную окружения для API ключа
  });

  try {
    const result = await client.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-R1', // Здесь проверь, что это правильная модель, доступная для использования
      store: true,
      messages: [
        { 'role': 'user', 'content': prompt },
      ],
    });

    const resultFin = extractFinalJSON(result.choices[0].message);

    console.log('RESULT FIN', resultFin);
    const insertedId = await saveAiResponseToDatabase(intUserId, resultFin); // если нужно, сохраняем ответ в базе данных
    resultFin.inserted_id = insertedId;
    resultFin.user_id = intUserId;
    return resultFin;
  } catch (error) {
    console.error('Error:', error);
  }

  return;
};

const getPatAiRes = async (id) => {
  try {
    const sql = `SELECT result_pat_text FROM ai_results
              WHERE pat_id = ${id}
              ORDER BY result_date DESC
              LIMIT 1`;
    const [rows] = await promisePool.query(sql);

    console.log(rows[0]);
    return rows[0];
  } catch (e) {
    console.error('error:', e);
  }
};

const fullAiRes = async (id) => {
  try {
    const sql = `SELECT * FROM ai_results
              WHERE pat_id = ${id}
              ORDER BY result_date DESC
              LIMIT 100`;
    const [rows] = await promisePool.query(sql);

    console.log(rows);
    return rows;
  } catch (e) {
    console.error('error:', e);
  }
};


const saveAiResponseToDatabase = async(userId, aiRes) => {
  console.log('SAVED', aiRes);




  try {
    const sql = `INSERT INTO ai_results (pat_id, result_status, result_pat_text, result_doc_text, readed)
                VALUES (?, ?, ?, ?, ?)`;
    const params = [userId, aiRes.status, aiRes.patient_instruction, aiRes.doctor_note, 'false'];

    const [result] = await promisePool.query(sql, params);
    const insertId = result.insertId;
    const alarm = aiRes.recommend_immediate_attention;
    if (alarm) {
      console.log('ALARM!');
    }
    return insertId;
  } catch (e) {
    console.error('error:', e);
  }
};

function createPrompt(metrics, age, hr, lastMetrics, date) {
  console.log(metrics);
  const prompt = `
    You are a medical assistant AI. Analyze the following real-time heart rate variability (HRV) data and assess the risk of an acute cardiac event (e.g., myocardial infarction). Respond in JSON.

    Patient profile:
    - Age: ${age}

    Current metrics (${date}):
    - Heart Rate: ${hr} bpm
    - SDNN: ${metrics.sdnn} ms
    - RMSSD: ${metrics.rmssd} ms
    - pNN50: ${metrics.pnn50}%
    - LF/HF suhde: ${metrics.lfhf}
    - mean RR: ${metrics.rr_mean}

    Previous hourly metrics:
    1. ${lastMetrics[0]}
    2. ${lastMetrics[1]}

    Please respond ONLY with valid JSON. Like this:
    {
      "status": "normal | warning | critical",
      "patient_instruction": "short sentence, max 150 characters",
      "doctor_note": "brief observation or suggestion (1-5 sentences)",
      "recommend_immediate_attention": true | false
    }
    ! Do not add explanations or comments.
`;

  return prompt;
};

function extractFinalJSON(aiResponse) {
  const match = aiResponse.content.match(/{[\s\S]*}$/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error('Ошибка при парсинге JSON:', e);
    }
  }
  return null;
};

const testUserData = {
  userId: '12345',
  metrics: { sdnn: 50, rmssd: 40, pnn50: 61, lfhf: 1.02, mean_rr: 0.9 },  // пример метрик
  userAge: 45,
  hr: 75,
  measureDate: Date.now(),
};

const testUserData1 = {
  user_id: '1959',
  metrics: { sdnn: 50, rmssd: 40, pnn50: 61, lfhf: 1.02, mean_rr: 0.9 },
  userAge: 45,
  hr: 75,
  measureDate: Date.now(),
};

const testUserData2 = {
  userId: '67890',
  metrics: { sdnn: 65, rmssd: 52, pnn50: 70, lfhf: 0.85, mean_rr: 0.92 },
  userAge: 38,
  hr: 72,
  measureDate: Date.now(),
};

const testUserData3 = {
  userId: 'abcde',
  metrics: { sdnn: 30, rmssd: 25, pnn50: 42, lfhf: 1.45, mean_rr: 0.88 },
  userAge: 52,
  hr: 80,
  measureDate: Date.now(),
};

// Функция, которая вызовет вашу тестируемую функцию с тестовыми данными
const testMakeResearch = async() => {
  try {
    const result = await makeResearch(testUserData1);
    console.log('AI Response:', result);
  } catch (error) {
    console.error('Error during the test:', error);
  }
};

// Вызов теста
//testMakeResearch();


export { saveAiResponseToDatabase, makeResearch, getPatAiRes, fullAiRes };
