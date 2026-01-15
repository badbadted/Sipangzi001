<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1o0VfBKtuXmtUHbQ4A89EqQUOAa3vAo37

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. **設定環境變數（必需）：**
   
   創建 `.env.local` 文件並填入以下配置：

   **Firebase 配置（必需）：**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
   ```
   
   從 [Firebase Console](https://console.firebase.google.com/) 獲取這些值。

   **Gemini AI 配置（可選，僅用於 AI 分析功能）：**
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
   
   從 [Google AI Studio](https://aistudio.google.com/apikey) 獲取 API Key。

   詳細說明請參考 [ENV_SETUP.md](ENV_SETUP.md)

3. Run the app:
   ```bash
   npm run dev
   ```
