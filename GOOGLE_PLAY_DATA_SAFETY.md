# Google Play Data Safety 填寫草稿

本文件依目前 App 狀態撰寫：

- 不需要帳號
- 不使用後端伺服器
- 不含廣告
- 不含分析 SDK
- 不含推播
- Android Manifest 已移除 `INTERNET` 權限
- 資料只儲存在使用者裝置內的 WebView / LocalStorage

Google Play 的 Data Safety 表單由開發者自我申報，正式送審前仍需依 Play Console 當時畫面逐項確認。

## 核心判斷

目前建議申報：

- App 是否收集或分享任何必要揭露的使用者資料：**否**
- App 是否加密傳輸資料：**不適用**，因為 App 不會主動傳輸使用者資料到伺服器
- 使用者是否可要求刪除資料：**是，透過 App 內「清空」或系統清除 App 資料**
- 是否遵守 Families Policy：**否 / 不以兒童為目標客群**

## Data Collection

Play Console 問：「Does your app collect or share any of the required user data types?」

建議回答：

```text
No
```

理由：

- 使用者輸入的活動名稱、成員名稱、帳目、金額、銀行代碼與帳號只保存在裝置本機。
- App 沒有後端 API、分析 SDK、廣告 SDK，也沒有 Android 網路權限。
- 資料不會由 App 主動傳出裝置。

## Data Sharing

建議回答：

```text
No
```

理由：

- App 不會主動把資料傳給開發者或第三方。
- 「分享網址」是使用者主動複製並自行傳送，屬於使用者主導的分享行為。
- 隱私權政策已提醒：分享網址會包含活動資料，若填入銀行帳號，網址也會包含該資訊。

## Security Practices

### Data encrypted in transit

建議回答：

```text
Not applicable
```

理由：

- App 不主動傳輸使用者資料。
- 若使用者在網頁版開啟 GitHub Pages，網站本身使用 HTTPS；但資料仍主要保存在本機。

### Users can request that data be deleted

建議回答：

```text
Yes
```

說明：

- App 內有「清空」功能。
- 使用者也可透過 Android 系統設定清除 App 資料。

## App Content

### Ads

```text
No ads
```

### In-app purchases

```text
No
```

### Target audience

建議：

```text
18+
```

或依 Play Console 選項選擇「Adults」。此 App 涉及費用分攤與銀行帳號備註，不建議定位為兒童或家庭 App。

### News app

```text
No
```

### Government app

```text
No
```

### Health app

```text
No
```

### Financial features

此 App 不是銀行、支付、貸款、投資或保險服務。它只是費用記錄與分攤計算工具。

若 Play Console 問是否涉及金融功能，建議描述：

```text
The app is an expense splitting calculator. It does not process payments, transfer money, provide loans, offer investment advice, or connect to financial institutions.
```

## 若未來加入功能，需要更新申報

如果未來加入以下功能，Data Safety 需要重新評估：

- 雲端同步
- 帳號登入
- Google Analytics / Firebase Analytics
- Crashlytics
- 廣告 SDK
- 推播
- 後端資料庫
- 第三方支付或銀行串接
