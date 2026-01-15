# 除錯指南：新增秒數後畫面空白

## 🔍 問題診斷步驟

### 1. 檢查瀏覽器控制台

打開瀏覽器開發者工具（F12），查看 Console 標籤頁是否有錯誤訊息：

**常見錯誤：**

- **Firebase 初始化錯誤**
  ```
  缺少必要的 Firebase 環境變數：[...]
  ```
  → 解決：檢查 `.env.local` 文件是否正確設定

- **Firebase 連接錯誤**
  ```
  Firebase 初始化失敗：...
  ```
  → 解決：確認 Firebase 配置值是否正確

- **新增紀錄失敗**
  ```
  新增紀錄失敗：...
  ```
  → 解決：檢查 Firebase Database Rules 是否允許寫入

### 2. 檢查環境變數

確認 `.env.local` 文件存在且包含所有必要的變數：

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=...
```

**檢查方法：**
1. 在瀏覽器控制台輸入：`console.log(import.meta.env)`
2. 查看是否有 `VITE_FIREBASE_*` 變數

### 3. 檢查 Firebase Database Rules

前往 [Firebase Console](https://console.firebase.google.com/project/sipangzi001-4a02b/database)

確認 Realtime Database Rules 允許讀寫：

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

### 4. 檢查網路連線

- 確認網路連線正常
- 檢查是否有防火牆或代理阻擋 Firebase 連接
- 嘗試重新整理頁面

### 5. 清除快取

1. 清除瀏覽器快取
2. 清除 localStorage：
   ```javascript
   localStorage.clear();
   ```
3. 重新啟動開發伺服器：
   ```bash
   npm run dev
   ```

## 🛠️ 已添加的錯誤處理

### 1. Firebase 初始化檢查
- 檢查必要的環境變數
- 顯示警告訊息

### 2. 數據驗證
- 過濾無效的紀錄和選手數據
- 防止排序時發生錯誤

### 3. 錯誤邊界
- 捕獲渲染錯誤
- 顯示友好的錯誤訊息

### 4. 詳細的錯誤日誌
- 所有 Firebase 操作都有錯誤處理
- 控制台會顯示詳細的錯誤訊息

## 📝 調試步驟

### 步驟 1：檢查控制台錯誤

1. 打開瀏覽器開發者工具（F12）
2. 切換到 Console 標籤
3. 嘗試新增一個紀錄
4. 查看是否有紅色錯誤訊息

### 步驟 2：檢查網路請求

1. 切換到 Network 標籤
2. 過濾顯示 "firebase" 相關請求
3. 嘗試新增紀錄
4. 查看是否有失敗的請求（紅色）

### 步驟 3：檢查 React 錯誤

1. 切換到 Console 標籤
2. 查看是否有 React 錯誤訊息
3. 如果有錯誤邊界訊息，點擊查看詳情

### 步驟 4：檢查數據

在控制台輸入以下代碼檢查數據：

```javascript
// 檢查 Firebase 連接
console.log('Firebase DB:', window.db || '未找到');

// 檢查環境變數（在應用程式內）
// 需要在 App 組件內執行
```

## 🔧 常見問題解決

### 問題 1：環境變數未載入

**症狀：** 控制台顯示 "缺少必要的 Firebase 環境變數"

**解決：**
1. 確認 `.env.local` 文件存在於專案根目錄
2. 確認所有變數都以 `VITE_` 開頭
3. 重新啟動開發伺服器

### 問題 2：Firebase Database Rules 拒絕寫入

**症狀：** 控制台顯示 "新增紀錄失敗：permission-denied"

**解決：**
1. 前往 Firebase Console
2. 更新 Database Rules 允許寫入

### 問題 3：數據格式錯誤

**症狀：** 控制台顯示 "處理紀錄數據時發生錯誤"

**解決：**
1. 檢查 Firebase 中的數據格式
2. 確認所有紀錄都有 `timestamp` 和 `id` 欄位

### 問題 4：組件渲染錯誤

**症狀：** 畫面完全空白，錯誤邊界顯示錯誤訊息

**解決：**
1. 查看錯誤邊界顯示的錯誤詳情
2. 檢查是否有組件缺少必要的 props
3. 確認主題相關的代碼是否正確

## 🚨 緊急修復

如果問題持續，可以嘗試：

1. **重置應用程式狀態：**
   ```javascript
   // 在控制台執行
   localStorage.clear();
   location.reload();
   ```

2. **檢查 Firebase 專案狀態：**
   - 確認專案未被暫停
   - 確認配額未超限

3. **重新安裝依賴：**
   ```bash
   rm -rf node_modules
   npm install
   ```

## 📞 需要更多幫助？

如果以上步驟都無法解決問題，請提供：

1. 瀏覽器控制台的完整錯誤訊息
2. Network 標籤中失敗的請求詳情
3. `.env.local` 文件內容（隱藏實際的 API Key）
4. Firebase Database Rules 設定

---

**記住：** 所有錯誤現在都會在控制台顯示詳細訊息，這是最重要的調試工具！
