# 上架準備清單

## 公開網頁版

- 選擇部署平台：GitHub Pages、Cloudflare Pages、Netlify 或 Vercel。
- 部署根目錄需包含：
  - `index.html`
  - `styles.css`
  - `app.js`
  - `manifest.webmanifest`
  - `service-worker.js`
  - `privacy.html`
  - `icons/app-icon.svg`
- 部署後確認 HTTPS 可用，PWA 離線快取只會在 HTTPS 或 localhost 生效。
- 將正式網址填入 Google Play 與 App Store 的隱私權政策欄位。

## Google Play

- 建立 Google Play Console 開發者帳號。
- 準備正式 App ID，目前設定為 `io.github.nikolai0921.tripbilldivider`。
- 安裝 Android Studio。
- 執行：

```bash
npm install
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

- 在 Android Studio 產生 signed Android App Bundle (`.aab`)。
- 正式上架前需要建立 upload key，並在 `android/keystore.properties` 指向本機 keystore；不要把 keystore 或密碼提交到 GitHub。
- Play Console 需要準備：
  - App 名稱
  - 短描述與完整描述
  - 圖示
  - 手機截圖
  - 隱私權政策網址
- Data Safety 表單
- 內容分級問卷
- 測試軌與正式版發布設定
- Data Safety 填寫草稿請看 `GOOGLE_PLAY_DATA_SAFETY.md`
- 封閉測試計畫請看 `CLOSED_TESTING_PLAN.md`
- 多語言商店文案請看 `STORE_LOCALIZATION_PACK.md`

## iOS App Store

- 加入 Apple Developer Program。
- 需要 macOS 與 Xcode。
- 執行：

```bash
npm install
npm run cap:add:ios
npm run cap:sync
npm run cap:open:ios
```

- 在 Xcode 設定 Signing & Capabilities。
- 透過 Xcode Archive 上傳 App Store Connect。
- App Store Connect 需要準備：
  - App 名稱
  - 副標題與描述
  - 關鍵字
  - App icon
  - iPhone 截圖
  - iPad 截圖
  - 隱私權政策網址
  - App Privacy 問卷

## 隱私與資料聲明建議

目前版本不需要註冊帳號，不會主動上傳資料。使用者輸入的活動、帳目、成員與銀行帳號資料儲存在瀏覽器 LocalStorage 中。分享網址會包含活動資料，因此若填入銀行帳號，該資訊也會包含在分享網址中。
