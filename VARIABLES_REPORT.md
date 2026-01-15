# 專案變數清單報告

## 📋 變數使用情況總覽

### ✅ 已修復的問題

1. **未使用的變數**
   - `components/Analysis.tsx` 中的 `fullDate` 變數已移除（第 34 行）

### 📝 主要變數清單

#### App.tsx
- **State 變數：**
  - `activeTab`: 當前活動的標籤頁（'record' | 'history' | 'analysis'）
  - `racers`: 選手列表（Racer[]）
  - `records`: 紀錄列表（Record[]）
  - `selectedRacerId`: 當前選中的選手 ID（string | null）

- **函數：**
  - `getLocalDateStr()`: 獲取本地日期字串（YYYY-MM-DD）
  - `addRacer()`: 新增選手
  - `deleteRacer()`: 刪除選手
  - `addRecord()`: 新增紀錄
  - `deleteRecord()`: 刪除紀錄
  - `renderContent()`: 渲染內容

#### components/Analysis.tsx
- **State 變數：**
  - `selectedRacerId`: 選中的選手 ID（string）
  - `selectedDistance`: 選中的距離（Distance: 10 | 30 | 50）
  - `analysisResult`: AI 分析結果（string | null）
  - `isAnalyzing`: 是否正在分析（boolean）

- **計算變數：**
  - `chartData`: 圖表數據（useMemo）
  - `bestTime`: 最佳時間
  - `avgTime`: 平均時間

#### components/HistoryLog.tsx
- **State 變數：**
  - `deleteId`: 待刪除的紀錄 ID（string | null）

- **計算變數：**
  - `groupedRecords`: 按日期分組的紀錄（useMemo）
  - `getRacer()`: 根據 ID 獲取選手

#### components/RecordForm.tsx
- **State 變數：**
  - `distance`: 選中的距離（Distance）
  - `timeStr`: 時間字串（string）

#### components/RacerList.tsx
- **State 變數：**
  - `isAdding`: 是否正在新增選手（boolean）
  - `newName`: 新選手名稱（string）
  - `selectedColor`: 選中的顏色（string）

#### services/geminiService.ts
- **常數：**
  - `env`: 環境變數對象
  - `apiKey`: Gemini API 金鑰
  - `genAI`: GoogleGenerativeAI 實例（可能為 null）

- **函數：**
  - `analyzePerformance()`: 分析選手表現

#### firebase.ts
- **常數：**
  - `env`: 環境變數對象
  - `firebaseConfig`: Firebase 配置對象
  - `app`: Firebase 應用實例（未導出，但被 `db` 使用）
  - `db`: 導出的資料庫實例

### 🔧 環境變數清單

#### Firebase 環境變數（firebase.ts）
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_URL`

#### Gemini AI 環境變數（services/geminiService.ts）
- `VITE_GEMINI_API_KEY`（優先）
- `GEMINI_API_KEY`（備用）
- `process.env.GEMINI_API_KEY`（備用，用於 Node.js 環境）

#### Vite 配置環境變數（vite.config.ts）
- `GEMINI_API_KEY`（從 .env 文件讀取）
- 定義為 `process.env.API_KEY`（未使用，可能為向後兼容保留）
- 定義為 `process.env.GEMINI_API_KEY`

### ⚠️ 注意事項

1. **未使用的配置：**
   - `vite.config.ts` 中的 `process.env.API_KEY` 定義了但未在代碼中使用
   - 可能是為了向後兼容而保留

2. **環境變數命名：**
   - Firebase 變數統一使用 `VITE_` 前綴
   - Gemini API 變數支援多種命名方式以增加兼容性

3. **類型安全：**
   - 多處使用 `@ts-ignore` 來繞過類型檢查
   - 建議未來改進類型定義

4. **變數作用域：**
   - 所有組件變數都正確使用 React Hooks
   - 沒有發現變數洩漏或作用域問題

### ✅ 變數命名規範

- **State 變數：** 使用 camelCase，如 `selectedRacerId`
- **函數：** 使用 camelCase，如 `addRacer`
- **常數：** 使用 UPPER_SNAKE_CASE，如 `DISTANCES`
- **環境變數：** 使用 `VITE_` 前綴 + UPPER_SNAKE_CASE

### 📊 統計

- **總變數數：** ~50+
- **State 變數：** 10
- **環境變數：** 8
- **函數：** 15+
- **已修復問題：** 1（移除未使用的 `fullDate`）

---

*報告生成時間：2024*
