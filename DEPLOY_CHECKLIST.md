# Vercel 部署檢查清單

## ✅ 部署前檢查

### 1. 環境變數準備
- [ ] 已準備所有 Firebase 配置值
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN` (sipangzi001-4a02b.firebaseapp.com)
  - [ ] `VITE_FIREBASE_PROJECT_ID` (sipangzi001-4a02b)
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET` (sipangzi001-4a02b.appspot.com)
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
  - [ ] `VITE_FIREBASE_DATABASE_URL` (https://sipangzi001-4a02b-default-rtdb.firebaseio.com/)

### 2. 本地測試
- [ ] 本地 `.env.local` 已正確設定
- [ ] `npm run build` 可以成功建置
- [ ] `npm run dev` 可以正常運行
- [ ] 本地測試功能正常（新增選手、新增紀錄等）

### 3. Firebase 設定
- [ ] Firebase Database Rules 已設定（允許讀寫）
- [ ] Firebase 專案已啟用 Realtime Database

### 4. Git 準備
- [ ] 所有變更已提交到 Git
- [ ] `.env.local` 已在 `.gitignore` 中（不會被提交）

## 🚀 部署步驟

### 方法一：Vercel CLI

1. [ ] 安裝 Vercel CLI: `npm i -g vercel`
2. [ ] 登入: `vercel login`
3. [ ] 部署: `vercel`
4. [ ] 設定環境變數（見下方）
5. [ ] 部署到生產環境: `vercel --prod`

### 方法二：GitHub 整合

1. [ ] 專案已推送到 GitHub
2. [ ] 在 Vercel 網站連接 GitHub 儲存庫
3. [ ] 設定環境變數（見下方）
4. [ ] 點擊 Deploy

## ⚙️ Vercel 環境變數設定

在 Vercel Dashboard → Settings → Environment Variables 中新增：

- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_DATABASE_URL`

**重要：** 勾選 Production、Preview、Development 三個環境

## ✅ 部署後驗證

- [ ] 訪問部署的 URL，確認網站可以正常載入
- [ ] 測試新增選手功能
- [ ] 測試新增紀錄功能
- [ ] 測試查看歷史紀錄
- [ ] 測試數據分析功能
- [ ] （如果有設定）測試 AI 分析功能
- [ ] 檢查瀏覽器 Console 是否有錯誤

## 🔧 故障排除

如果遇到問題：

1. [ ] 檢查 Vercel 建置日誌
2. [ ] 確認所有環境變數都已正確設定
3. [ ] 確認環境變數名稱都有 `VITE_` 前綴
4. [ ] 重新部署專案
5. [ ] 檢查 Firebase Database Rules
6. [ ] 查看瀏覽器 Console 錯誤訊息

## 📝 快速命令參考

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署（預覽）
vercel

# 部署到生產環境
vercel --prod

# 查看環境變數
vercel env ls

# 新增環境變數
vercel env add VITE_FIREBASE_API_KEY
```

---

**完成所有檢查項目後，您的應用程式就可以成功部署到 Vercel 了！** 🎉
