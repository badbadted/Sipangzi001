# Vercel 環境變數環境說明

## 🎯 三個環境的意義

在 Vercel 設定環境變數時，您會看到三個選項可以勾選：

1. **Production（生產環境）** 🟢
2. **Preview（預覽環境）** 🟡
3. **Development（開發環境）** 🔵

## 📋 各環境的用途

### 1. Production（生產環境）🟢

**何時使用：**
- 當您部署到**主要網址**時（例如：`your-app.vercel.app`）
- 當您推送到 `main` 或 `master` 分支時
- 這是**正式上線**的環境

**特點：**
- 使用正式網址
- 所有用戶訪問的版本
- 應該使用生產環境的 API Key 和配置

**範例：**
```
https://your-app.vercel.app
```

### 2. Preview（預覽環境）🟡

**何時使用：**
- 當您推送到**其他分支**時（例如：`feature/new-feature`）
- 當您建立 **Pull Request** 時
- 用於**測試新功能**，不影響正式環境

**特點：**
- Vercel 會自動為每個分支/PR 創建一個預覽 URL
- 格式類似：`your-app-git-feature-branch.vercel.app`
- 用於測試和審查

**範例：**
```
https://your-app-git-feature-branch.vercel.app
https://your-app-abc123.vercel.app  (PR 預覽)
```

### 3. Development（開發環境）🔵

**何時使用：**
- 當您使用 `vercel dev` 命令在本地運行時
- 用於**本地開發測試**

**特點：**
- 在您的電腦上運行
- 模擬 Vercel 的環境
- 用於開發和除錯

**範例：**
```bash
vercel dev
# 會在本地啟動，例如：http://localhost:3000
```

## ✅ 為什麼要勾選三個環境？

### 建議做法：全部勾選

對於您的專案（Firebase 配置），建議**三個環境都勾選**，因為：

1. **相同的配置**
   - Firebase 配置在所有環境中都是相同的
   - 不需要區分開發/生產的 Firebase 專案

2. **避免錯誤**
   - 如果只勾選 Production，Preview 和 Development 會找不到環境變數
   - 導致部署失敗或功能異常

3. **方便開發**
   - 本地開發時（`vercel dev`）也能正常使用
   - 測試分支時也能正常運作

### 何時需要區分環境？

只有在以下情況才需要區分：

1. **不同的 API Key**
   - 例如：開發環境用測試 API，生產環境用正式 API
   - 您的 Firebase 專案通常不需要這樣做

2. **不同的資料庫**
   - 例如：開發環境用測試資料庫，生產環境用正式資料庫
   - 如果您的 Firebase 專案有區分，可以設定不同的 `VITE_FIREBASE_DATABASE_URL`

## 🖼️ 在 Vercel Dashboard 中的操作

當您新增環境變數時，會看到這樣的介面：

```
變數名稱: VITE_FIREBASE_API_KEY
變數值: your_api_key_here

環境:
☑ Production
☑ Preview  
☑ Development
```

**操作步驟：**
1. 輸入變數名稱和值
2. **勾選三個環境的核取方塊**（建議全部勾選）
3. 點擊「Save」

## 📝 實際範例

### 範例 1：全部勾選（推薦）

```
VITE_FIREBASE_API_KEY=abc123...
☑ Production
☑ Preview
☑ Development
```

**結果：**
- ✅ 正式網址可以使用
- ✅ 預覽分支可以使用
- ✅ 本地開發可以使用

### 範例 2：只勾選 Production（不推薦）

```
VITE_FIREBASE_API_KEY=abc123...
☑ Production
☐ Preview
☐ Development
```

**結果：**
- ✅ 正式網址可以使用
- ❌ 預覽分支會失敗（找不到環境變數）
- ❌ 本地開發會失敗（找不到環境變數）

## 🎯 針對您的專案建議

對於您的滑步車紀錄應用程式：

**建議：所有 Firebase 環境變數都勾選三個環境**

因為：
- Firebase 配置在所有環境中都是相同的
- 您使用的是同一個 Firebase 專案（sipangzi001-4a02b）
- 這樣可以確保所有環境都能正常運作

**設定清單：**
```
VITE_FIREBASE_API_KEY          ☑ ☑ ☑
VITE_FIREBASE_AUTH_DOMAIN      ☑ ☑ ☑
VITE_FIREBASE_PROJECT_ID       ☑ ☑ ☑
VITE_FIREBASE_STORAGE_BUCKET   ☑ ☑ ☑
VITE_FIREBASE_MESSAGING_SENDER_ID  ☑ ☑ ☑
VITE_FIREBASE_APP_ID           ☑ ☑ ☑
VITE_FIREBASE_DATABASE_URL     ☑ ☑ ☑
```

## 🔍 如何檢查環境變數是否正確設定？

### 在 Vercel Dashboard：

1. 前往專案 → **Settings** → **Environment Variables**
2. 查看每個變數旁邊的環境標籤
3. 應該看到三個環境都有勾選

### 使用 Vercel CLI：

```bash
# 查看所有環境變數
vercel env ls

# 查看特定環境的變數
vercel env ls production
vercel env ls preview
vercel env ls development
```

## ⚠️ 常見錯誤

### 錯誤 1：只勾選 Production

**問題：** Preview 部署失敗，找不到環境變數

**解決：** 勾選 Preview 和 Development

### 錯誤 2：忘記勾選 Development

**問題：** 本地使用 `vercel dev` 時無法連接 Firebase

**解決：** 勾選 Development

### 錯誤 3：不同環境使用不同的值但忘記更新

**問題：** 某個環境使用舊的配置值

**解決：** 檢查每個環境的變數值是否正確

## 📚 總結

**簡單記住：**
- **Production** = 正式上線版本
- **Preview** = 測試分支/PR 版本
- **Development** = 本地開發版本

**建議做法：**
- 對於 Firebase 配置，**全部勾選三個環境**
- 這樣可以確保所有環境都能正常運作
- 避免部署失敗或功能異常

---

**記住：勾選三個環境 = 確保所有環境都能正常運作！** ✅
