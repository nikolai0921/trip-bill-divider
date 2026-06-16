# Google Play 封閉測試計畫

## 適用情境

若你的 Google Play Console 是 2023-11-13 之後建立的個人開發者帳號，Google Play 通常會要求正式發布前先完成封閉測試。

目前官方要求常見重點：

- 至少 12 位測試者
- 測試者需 opt-in
- 連續至少 14 天
- 測試完成後才能申請 production access

請以 Play Console 當下顯示的規則為準。

## 建議測試名單

準備 15 至 20 位測試者，避免有人中途沒有加入。

每位測試者需要：

- Google 帳號 email
- Android 手機
- 可以安裝 Google Play 測試版

## 測試流程

1. 在 Google Play Console 建立 App。
2. 上傳 signed `.aab` 到 Closed testing track。
3. 建立 tester email list 或 Google Group。
4. 發布封閉測試版本。
5. 將 opt-in 測試連結傳給測試者。
6. 請測試者加入測試、安裝 App、實際使用。
7. 維持至少 14 天。
8. 收集回饋與修正問題。
9. 在 Play Console 申請 Production access。

## 測試者訊息範本

```text
嗨，我正在測試一款生活費用分攤 App，需要協助完成 Google Play 封閉測試。

請用 Android 手機打開以下測試連結，加入測試後安裝 App：

<貼上 Google Play 測試連結>

建議測試：
1. 新增一個活動
2. 新增 2-3 位成員
3. 新增一筆均分帳目
4. 新增一筆指定人分攤帳目
5. 查看結算結果
6. 試用複製 LINE 文字
7. 關閉 App 後重新打開，確認資料是否保留

如果遇到錯誤或覺得哪裡不好用，請截圖回傳給我。謝謝！
```

## 測試回饋表欄位

可以用 Google Forms 建一份簡單表單：

- 測試者姓名
- 手機品牌與型號
- Android 版本
- 是否成功安裝
- 是否成功新增活動
- 是否成功新增帳目
- 是否成功看到結算
- 是否成功複製 LINE 文字
- 遇到的問題
- 改善建議

## 建議測試重點

- 無網路狀態下是否能打開 App
- 清空資料是否正常
- 分享網址提醒是否清楚
- 小螢幕是否有文字擠壓
- 銀行帳號複製是否正常
- 結算金額是否符合預期
