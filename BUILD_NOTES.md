# 建置注意事項

## ⚠️ 關於 `node-domexception` 警告

當您執行 `npm install` 或 `npm run build` 時，可能會看到以下警告：

```
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
```

### 這個警告是什麼？

這是 npm 的棄用警告，表示某個依賴套件使用了已棄用的 `node-domexception` 套件。

### 會影響建置嗎？

**不會！** 這個警告：
- ✅ 不會影響建置過程
- ✅ 不會影響應用程式運行
- ✅ 只是提醒開發者使用原生 API

### 需要處理嗎？

**不需要立即處理**，因為：
1. 這是依賴套件的問題，不是您的程式碼問題
2. 不影響功能
3. 等待依賴套件更新即可

### 如何消除警告（可選）

如果您想消除警告，可以：

1. **更新所有套件到最新版本：**
   ```bash
   npm update
   ```

2. **檢查是否有套件更新：**
   ```bash
   npm outdated
   ```

3. **等待依賴套件更新：**
   - 通常套件維護者會在新版本中修復這個問題
   - 定期執行 `npm update` 即可

## ✅ 建置成功檢查

建置成功後，您應該看到：

1. **建置完成訊息：**
   ```
   ✓ built in Xs
   ```

2. **`dist` 目錄已建立：**
   - 包含所有建置後的檔案
   - `index.html`
   - JavaScript 和 CSS 檔案

3. **檔案大小合理：**
   - 通常幾百 KB 到幾 MB
   - 如果太大，可能需要優化

## 🔍 驗證建置結果

### 方法 1：檢查 dist 目錄

```bash
# 查看建置輸出
ls dist
# 或
dir dist
```

### 方法 2：本地預覽

```bash
npm run preview
```

然後訪問 `http://localhost:4173`（或 Vite 顯示的網址）

### 方法 3：檢查檔案

確認 `dist/index.html` 存在且包含正確的內容。

## 🚀 準備部署

建置成功後，`dist` 目錄就是準備部署到 Vercel 的內容。

Vercel 會自動：
1. 執行 `npm run build`
2. 使用 `dist` 目錄作為輸出
3. 部署到 CDN

## 📝 常見建置問題

### 問題 1：建置失敗

**可能原因：**
- 環境變數未設定
- TypeScript 錯誤
- 依賴套件問題

**解決方法：**
- 檢查錯誤訊息
- 確認 `.env.local` 已設定
- 執行 `npm install` 重新安裝依賴

### 問題 2：建置成功但檔案很大

**可能原因：**
- 未啟用程式碼分割
- 包含未使用的依賴

**解決方法：**
- Vite 預設會進行程式碼分割
- 檢查是否有大型未使用的套件

### 問題 3：建置成功但預覽無法運行

**可能原因：**
- 環境變數在預覽時無法讀取
- 路徑問題

**解決方法：**
- 確認使用 `npm run preview` 而不是 `npm run dev`
- 檢查相對路徑是否正確

## 💡 最佳實踐

1. **定期更新依賴：**
   ```bash
   npm update
   ```

2. **檢查建置大小：**
   - 使用 `npm run build` 後檢查 `dist` 目錄大小
   - 如果太大，考慮優化

3. **測試建置結果：**
   - 建置後使用 `npm run preview` 測試
   - 確認所有功能正常

4. **版本控制：**
   - 不要提交 `dist` 目錄到 Git
   - 確認 `.gitignore` 包含 `dist`

---

**記住：警告不會影響建置，只要看到建置成功訊息就沒問題！** ✅
