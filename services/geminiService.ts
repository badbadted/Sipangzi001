import { GoogleGenAI } from "@google/genai";
import { Racer, Record } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzePerformance = async (racer: Racer, records: Record[]): Promise<string> => {
  if (!apiKey) {
    return "請先設定 API Key 才能使用 AI 分析功能。";
  }

  // Filter last 20 records to keep context small and relevant
  const recentRecords = records
    .filter(r => r.racerId === racer.id)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20)
    .reverse(); // Chronological order for analysis

  if (recentRecords.length === 0) {
    return "目前還沒有紀錄可供分析，請先新增幾筆測速資料！";
  }

  const recordsSummary = recentRecords.map(r => 
    `- 日期: ${r.dateStr}, 距離: ${r.distance}米, 秒數: ${r.timeSeconds}秒`
  ).join("\n");

  const prompt = `
    你是一位專業且親切的兒童滑步車(Push Bike)教練。
    請分析選手「${racer.name}」的近期表現。
    
    數據如下：
    ${recordsSummary}
    
    請給出簡短的評語（約 100-150 字），包含：
    1. 觀察到的進步或趨勢。
    2. 針對不同距離的表現給予具體建議。
    3. 給予小朋友正向鼓勵，語氣要活潑、充滿能量，像在對孩子和家長說話。
    使用繁體中文回答。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "無法產生分析結果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 教練目前休息中，請稍後再試。（可能是 API Key 問題或連線錯誤）";
  }
};
