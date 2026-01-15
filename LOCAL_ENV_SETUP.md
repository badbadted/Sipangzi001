# 本地開發環境變數設定指南

## 🎯 問題說明

如果您在 Vercel 上已經設定了環境變數，但在本地開發時看到 "Firebase 未初始化" 的錯誤，這是因為本地缺少 `.env.local` 文件。

## ✅ 解決方案

### 方法一：從 Vercel Dashboard 複製（推薦）

1. **前往 Vercel Dashboard：**
   - 登入 [vercel.com](https://vercel.com)
   - 選擇您的專案
   - 前往 **Settings** → **Environment Variables**

2. **複製所有 Firebase 環境變數：**
   - 找到以下變數並複製它們的值：
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_DATABASE_URL`

3. **創建 `.env.local` 文件：**
   - 在專案根目錄創建 `.env.local` 文件
   - 將以下內容複製到文件中，並填入從 Vercel 複製的值：

```env
VITE_FIREBASE_API_KEY=從Vercel複製的值
VITE_FIREBASE_AUTH_DOMAIN=從Vercel複製的值
VITE_FIREBASE_PROJECT_ID=從Vercel複製的值
VITE_FIREBASE_STORAGE_BUCKET=從Vercel複製的值
VITE_FIREBASE_MESSAGING_SENDER_ID=從Vercel複製的值
VITE_FIREBASE_APP_ID=從Vercel複製的值
VITE_FIREBASE_DATABASE_URL=從Vercel複製的值
```

### 方法二：使用 Vercel CLI（如果已安裝）

如果您已經安裝了 Vercel CLI，可以使用以下命令：

```bash
# 安裝 Vercel CLI（如果還沒安裝）
npm i -g vercel

# 登入 Vercel
vercel login

# 連結專案（如果還沒連結）
vercel link

# 拉取環境變數到本地
vercel env pull .env.local
```

這個命令會自動從 Vercel 下載所有環境變數並創建 `.env.local` 文件。

### 方法三：手動創建（如果知道 Firebase 配置）

如果您知道 Firebase 配置值，可以直接創建 `.env.local` 文件：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=sipangzi001-4a02b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sipangzi001-4a02b
VITE_FIREBASE_STORAGE_BUCKET=sipangzi001-4a02b.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://sipangzi001-4a02b-default-rtdb.firebaseio.com/
```

## 📝 重要注意事項

1. **`.env.local` 不會被提交到 Git**
   - 此文件已在 `.gitignore` 中
   - 請勿將包含真實 API Key 的文件提交到版本控制

2. **重新啟動開發伺服器**
   - 創建或修改 `.env.local` 後，必須重新啟動 `npm run dev`
   - 環境變數只在啟動時載入

3. **文件位置**
   - `.env.local` 必須放在專案根目錄（與 `package.json` 同一層）

## 🔍 驗證設定

設定完成後：

1. **重新啟動開發伺服器：**
   ```bash
   # 停止當前的開發伺服器（Ctrl+C）
   # 然後重新啟動
   npm run dev
   ```

2. **檢查是否成功：**
   - 打開瀏覽器開發者工具（F12）
   - 查看 Console 標籤
   - 應該看到 "Firebase 初始化成功" 的訊息
   - 不應該再看到 "Firebase 未初始化" 的錯誤

3. **測試功能：**
   - 嘗試新增選手
   - 嘗試新增紀錄
   - 確認 Firebase 連接正常

## 🐛 常見問題

### 問題 1：重新啟動後仍然顯示錯誤

**解決方案：**
- 確認 `.env.local` 文件在正確的位置（專案根目錄）
- 確認所有變數名稱都以 `VITE_` 開頭
- 確認沒有多餘的空格或引號
- 檢查文件編碼（應該是 UTF-8）

### 問題 2：無法從 Vercel 複製環境變數

**解決方案：**
- 確認您有專案的訪問權限
- 嘗試使用 Vercel CLI 的 `vercel env pull` 命令
- 或聯繫專案管理員獲取環境變數

### 問題 3：環境變數值包含特殊字符

**解決方案：**
- 通常不需要加引號
- 如果值包含空格，可能需要加引號：`VITE_FIREBASE_API_KEY="value with spaces"`
- 但通常 Firebase 配置值不包含空格

## 📚 相關文件

- [ENV_SETUP.md](ENV_SETUP.md) - 詳細的環境變數設定說明
- [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) - Vercel 部署指南
- [VERCEL_ENVIRONMENTS.md](VERCEL_ENVIRONMENTS.md) - Vercel 環境說明

---

**設定完成後，您的本地開發環境應該能正常連接到 Firebase！** 🎉
