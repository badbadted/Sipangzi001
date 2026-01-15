# 環境變數設定說明

## 📋 是否需要 `.env.local`？

**是的，必須定義 `.env.local` 文件！**

專案需要環境變數才能正常運行，特別是 Firebase 配置。

## 🚀 快速設定步驟

1. **複製範本文件：**

   ```bash
   cp .env.local.example .env.local
   ```

2. **填入 Firebase 配置：**

   - 前往 [Firebase Console](https://console.firebase.google.com/)
   - 選擇或創建專案
   - 進入「專案設定」→「一般」→「您的應用程式」
   - 複製所有 Firebase 配置值到 `.env.local`

## 📝 環境變數清單

### 🔴 必需變數（Firebase）

這些變數是應用程式運行的**必需**項目：

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
```

**如何獲取：**

1. 登入 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案（或創建新專案）
3. 點擊 ⚙️ 設定圖示 → 「專案設定」
4. 滾動到「您的應用程式」區塊
5. 如果還沒有 Web 應用程式，點擊「新增應用程式」→ 選擇 Web 圖示
6. 複製配置值

## ⚠️ 重要注意事項

1. **`.env.local` 不會被提交到 Git**

   - 此文件已在 `.gitignore` 中
   - 請勿將包含真實 API Key 的文件提交到版本控制

2. **VITE\_ 前綴**

   - 所有需要在瀏覽器中使用的環境變數必須以 `VITE_` 開頭
   - 這是 Vite 的安全機制

3. **重新啟動開發伺服器**

   - 修改 `.env.local` 後，需要重新啟動 `npm run dev`
   - 環境變數在啟動時載入

4. **生產環境部署**
   - 部署時需要在部署平台（如 Vercel、Netlify）設定環境變數
   - 不要將 `.env.local` 文件部署到生產環境

## 🔍 驗證設定

設定完成後，執行：

```bash
npm run dev
```

如果 Firebase 配置正確，應用程式應該能正常連接到 Firebase 並顯示資料。

如果看到錯誤訊息，請檢查：

- 所有 Firebase 變數是否都已填入
- 變數名稱是否正確（包含 `VITE_` 前綴）
- 是否重新啟動了開發伺服器
