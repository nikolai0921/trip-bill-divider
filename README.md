# 輕量版生活費用分攤器

免註冊、免後端的單頁拆帳工具。直接開啟 `index.html` 即可使用，也可以部署到任何靜態網站服務。

## 功能

- 活動名稱與成員管理
- 成員銀行代碼與帳號備註
- 三種分攤模式：
  - 均分
  - 指定成員均分
  - 個別金額加公共費用比例分攤
- 貪婪演算法最佳化清算，減少轉帳次數
- 每位成員的已墊付、應分攤、淨餘額摘要
- 轉帳清單可標記已付款
- 一鍵複製 LINE 催款文字
- 一鍵複製收款人銀行帳號
- LocalStorage 自動保存
- 透過壓縮網址參數分享活動資料
- PWA manifest 與離線快取
- Capacitor Android / iOS 打包設定

## 使用方式

直接用瀏覽器開啟：

```text
index.html
```

或啟動任意靜態伺服器後開啟首頁。整個 App 只依賴：

- `index.html`
- `styles.css`
- `app.js`

不需要安裝 npm 套件。

## 公開網頁部署

把整個資料夾部署到支援 HTTPS 的靜態網站平台即可，例如 GitHub Pages、Cloudflare Pages、Netlify 或 Vercel。

PWA 相關檔案：

- `manifest.webmanifest`
- `service-worker.js`
- `icons/app-icon.svg`
- `privacy.html`

## 手機 App 打包

此專案已加入 Capacitor 設定，並已產生 `android/` 與 `ios/` 專案骨架。第一次在新環境使用前先安裝依賴：

```bash
npm install
```

每次修改 Web App 後，同步到手機專案：

```bash
npm run cap:sync
```

開啟 Android 專案：

```bash
npm run cap:open:android
```

開啟 iOS 專案：

```bash
npm run cap:open:ios
```

Android 需要 Android Studio；iOS 需要 macOS 與 Xcode。

詳細上架清單請看 `STORE_SUBMISSION_CHECKLIST.md`。

Android 發布細節請看 `ANDROID_RELEASE.md`。

Google Play 上架資料：

- `GOOGLE_PLAY_DATA_SAFETY.md`
- `CLOSED_TESTING_PLAN.md`
- `STORE_LOCALIZATION_PACK.md`
- `APP_LOCALIZATION_PLAN.md`
- `PLAY_CONSOLE_APP_SETUP.md`
