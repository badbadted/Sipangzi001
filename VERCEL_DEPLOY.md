# Vercel 部署指南

## 🚀 快速部署步驟

### 方法一：透過 Vercel CLI（推薦）

1. **安裝 Vercel CLI：**
   ```bash
   npm i -g vercel
   ```

2. **登入 Vercel：**
   ```bash
   vercel login
   ```

3. **部署專案：**
   ```bash
   vercel
   ```
   
   首次部署會詢問一些問題，直接按 Enter 使用預設值即可。

4. **部署到生產環境：**
   ```bash
   vercel --prod
   ```

### 方法二：透過 GitHub 整合（推薦用於持續部署）

1. **將專案推送到 GitHub：**
   ```bash
   git add .
   git commit -m "準備部署到 Vercel"
   git push origin main
   ```

2. **在 Vercel 網站上：**
   - 前往 [vercel.com](https://vercel.com)
   - 點擊「Add New Project」
   - 選擇您的 GitHub 儲存庫
   - Vercel 會自動偵測 Vite 專案

3. **設定環境變數（見下方）**

4. **點擊「Deploy」**

## ⚙️ 環境變數設定

**重要：** 在 Vercel 上必須設定所有環境變數，因為 `.env.local` 不會被部署。

### 在 Vercel Dashboard 設定：

1. 前往專案設定 → **Settings** → **Environment Variables**

2. **新增以下 Firebase 環境變數：**

   ```
   VITE_FIREBASE_API_KEY=你的_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=sipangzi001-4a02b.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=sipangzi001-4a02b
   VITE_FIREBASE_STORAGE_BUCKET=sipangzi001-4a02b.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=你的_messaging_sender_id
   VITE_FIREBASE_APP_ID=你的_app_id
   VITE_FIREBASE_DATABASE_URL=https://sipangzi001-4a02b-default-rtdb.firebaseio.com/
   ```

3. **選擇環境：**
   - 勾選 **Production**、**Preview**、**Development**（建議全部勾選）
   - **為什麼要勾選三個？** 見下方說明

5. **點擊「Save」**

### 💡 為什麼要勾選三個環境？

- **Production**：正式上線版本（推送到 main 分支時使用）
- **Preview**：預覽版本（推送到其他分支或建立 PR 時使用）
- **Development**：本地開發版本（使用 `vercel dev` 時使用）

**建議全部勾選**，因為您的 Firebase 配置在所有環境中都是相同的。如果只勾選 Production，Preview 和 Development 環境會找不到環境變數，導致部署失敗。

詳細說明請參考 [VERCEL_ENVIRONMENTS.md](VERCEL_ENVIRONMENTS.md)

### 透過 Vercel CLI 設定：

```bash
# 設定 Firebase 環境變數
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_DATABASE_URL

每次執行 `vercel env add` 時，會提示您輸入值並選擇環境（Production/Preview/Development）。

## 📋 部署配置說明

### vercel.json

專案已包含 `vercel.json` 配置文件，包含以下設定：

- **buildCommand**: `npm run build` - 建置命令
- **outputDirectory**: `dist` - Vite 的預設輸出目錄
- **framework**: `vite` - 告訴 Vercel 這是 Vite 專案
- **rewrites**: SPA 路由重寫規則，確保所有路由都指向 `index.html`

### 自動偵測

即使沒有 `vercel.json`，Vercel 也能自動偵測 Vite 專案並使用正確的配置。

## 🔍 驗證部署

部署完成後：

1. **檢查部署狀態：**
   - 在 Vercel Dashboard 查看部署日誌
   - 確認建置成功（Build Log 中沒有錯誤）

2. **測試應用程式：**
   - 訪問 Vercel 提供的 URL（例如：`https://your-project.vercel.app`）
   - 確認 Firebase 連接正常
   - 測試基本功能（新增選手、新增紀錄等）

3. **檢查環境變數：**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 確認所有變數都已正確設定

## 🐛 常見問題

### 問題 1：建置失敗

**解決方案：**
- 檢查 `package.json` 中的依賴是否正確
- 確認 Node.js 版本（Vercel 預設使用 Node.js 18+）
- 查看建置日誌中的錯誤訊息

### 問題 2：環境變數未生效

**解決方案：**
- 確認所有變數都以 `VITE_` 開頭
- 重新部署專案（環境變數變更後需要重新部署）
- 檢查變數是否設定在正確的環境（Production/Preview）

### 問題 3：路由 404 錯誤

**解決方案：**
- 確認 `vercel.json` 中的 `rewrites` 規則正確
- 這是 SPA（單頁應用）必需的配置

### 問題 4：Firebase 連接失敗

**解決方案：**
- 檢查 Firebase 環境變數是否正確
- 確認 Firebase 專案的 Database Rules 允許讀寫
- 檢查 Firebase Console 中的 Database URL 是否正確

## 🔐 Firebase Database Rules 設定

為了讓應用程式正常運作，請在 Firebase Console 設定 Database Rules：

1. 前往 [Firebase Console](https://console.firebase.google.com/project/sipangzi001-4a02b/database)
2. 選擇 **Realtime Database** → **Rules**
3. 設定規則（開發階段可以使用較寬鬆的規則）：

```json
{
  "rules": {
    "racers": {
      ".read": true,
      ".write": true
    },
    "records": {
      ".read": true,
      ".write": true
    }
  }
}
```

**注意：** 生產環境建議設定更嚴格的規則，例如需要身份驗證。

## 📝 持續部署

如果使用 GitHub 整合：

- 每次推送到 `main` 分支會自動部署到 Production
- 推送到其他分支會創建 Preview 部署
- Pull Request 會自動創建 Preview 部署供測試

## 🔄 更新部署

### 更新程式碼：
```bash
git add .
git commit -m "更新內容"
git push origin main
```

Vercel 會自動偵測變更並重新部署。

### 更新環境變數：
1. 在 Vercel Dashboard → Settings → Environment Variables
2. 編輯或新增變數
3. 重新部署（或等待下次自動部署）

## 📚 相關資源

- [Vercel 文件](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Firebase Console](https://console.firebase.google.com/project/sipangzi001-4a02b)

---

**部署完成後，您的應用程式將可以在全球 CDN 上快速訪問！** 🎉
