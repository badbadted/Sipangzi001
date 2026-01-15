<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 滑步車小車手紀錄 (Push Bike Tracker)

一個用於記錄和追蹤滑步車選手測速成績的 Web 應用程式。

## 🚀 快速開始

### 本地開發

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

   詳細說明請參考 [ENV_SETUP.md](ENV_SETUP.md)

3. Run the app:
   ```bash
   npm run dev
   ```

## 🌐 部署到 Vercel

專案已配置好 Vercel 部署設定。詳細部署說明請參考 [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)

### 快速部署步驟：

1. **安裝 Vercel CLI：**
   ```bash
   npm i -g vercel
   ```

2. **部署：**
   ```bash
   vercel
   ```

3. **在 Vercel Dashboard 設定環境變數：**
   - 前往專案設定 → Environment Variables
   - 新增所有 `VITE_FIREBASE_*` 變數
   - 詳細說明見 [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)

## 📚 相關文件

- [環境變數設定說明](ENV_SETUP.md)
- [Vercel 部署指南](VERCEL_DEPLOY.md)
- [Vercel 環境變數環境說明](VERCEL_ENVIRONMENTS.md) - 了解 Production/Preview/Development 的差異
