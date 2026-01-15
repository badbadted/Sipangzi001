import { GoogleGenerativeAI } from '@google/genai';
import { Racer, Record } from '../types';

// Get API key from environment variable
const env = (import.meta as any).env;
const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function analyzePerformance(racer: Racer, allRecords: Record[]): Promise<string> {
  if (!genAI) {
    return '請先設定 GEMINI_API_KEY 環境變數以使用 AI 分析功能。';
  }

  // Filter records for this racer
  const racerRecords = allRecords
    .filter(r => r.racerId === racer.id)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (racerRecords.length === 0) {
    return '目前還沒有足夠的紀錄可以進行分析。';
  }

  // Group by distance
  const recordsByDistance: { [key: number]: Record[] } = {};
  racerRecords.forEach(r => {
    if (!recordsByDistance[r.distance]) {
      recordsByDistance[r.distance] = [];
    }
    recordsByDistance[r.distance].push(r);
  });

  // Calculate statistics
  const stats = Object.entries(recordsByDistance).map(([distance, records]) => {
    const times = records.map(r => r.timeSeconds);
    const best = Math.min(...times);
    const worst = Math.max(...times);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const recent = records.slice(-5).map(r => r.timeSeconds);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    
    return {
      distance: parseInt(distance),
      count: records.length,
      best,
      worst,
      avg,
      recentAvg,
      improvement: recent.length >= 2 ? (recent[0] - recent[recent.length - 1]) : 0
    };
  });

  // Format data for AI
  const prompt = `你是一位專業的兒童運動教練，專門分析滑步車（push bike）選手的表現。

選手姓名：${racer.name}
總紀錄數：${racerRecords.length} 筆

各距離統計：
${stats.map(s => `
${s.distance}米：
  - 最佳成績：${s.best.toFixed(2)}秒
  - 平均成績：${s.avg.toFixed(2)}秒
  - 最差成績：${s.worst.toFixed(2)}秒
  - 紀錄次數：${s.count}次
  - 最近5次平均：${s.recentAvg.toFixed(2)}秒
  - 進步趨勢：${s.improvement > 0 ? '進步' : s.improvement < 0 ? '退步' : '持平'} ${Math.abs(s.improvement).toFixed(2)}秒
`).join('')}

請用親切、鼓勵的語氣，以繁體中文撰寫一份簡短的教練評語（約 100-150 字），包含：
1. 整體表現評價
2. 具體的進步或需要改進的地方
3. 給予鼓勵和建議

評語應該適合家長和小朋友閱讀，語氣正面且具建設性。`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return `分析時發生錯誤：${error.message || '未知錯誤'}`;
  }
}
