# Play Console 建立 App 逐步指南

## 1. 建立 App

在 Play Console 選擇：

```text
Create app
```

建議填寫：

- App name：`輕量版生活費用分攤器`
- Default language：`Chinese (Traditional) - zh-TW`
- App or game：`App`
- Free or paid：`Free`

## 2. Store listing

可先使用 `STORE_LISTING_DRAFT.md` 或 `STORE_LOCALIZATION_PACK.md`。

建議先填繁體中文：

- Short description：免註冊、免後端，快速完成聚餐與旅遊拆帳。
- Full description：使用 `STORE_LOCALIZATION_PACK.md` 的 zh-TW 版本。

## 3. Privacy Policy

填入：

```text
https://nikolai0921.github.io/trip-bill-divider/privacy.html
```

## 4. App access

建議：

```text
All functionality is available without special access.
```

因為 App 不需要帳號登入。

## 5. Ads

選擇：

```text
No, my app does not contain ads.
```

## 6. Content rating

依問卷回答：

- 不含暴力
- 不含成人內容
- 不含賭博
- 不含使用者產生公開內容
- 不含購物
- 不含位置分享

這個 App 是費用分攤工具，通常會落在低風險等級。

## 7. Target audience

建議：

```text
18 and over
```

理由：App 可輸入費用與銀行帳號備註，不建議定位為兒童 App。

## 8. Data Safety

請參考：

```text
GOOGLE_PLAY_DATA_SAFETY.md
```

目前建議：

- 不收集資料
- 不分享資料
- 無廣告
- 無分析 SDK
- 無網路權限
- 使用者資料只在本機保存

## 9. App category

可選：

```text
Finance
```

或：

```text
Tools
```

若 Play Console 對 Finance 類別提出更多審查問題，可改用 Tools，並在描述中強調它不是支付、貸款、投資或銀行服務。

## 10. Closed testing

如果你的帳號需要封閉測試，請看：

```text
CLOSED_TESTING_PLAN.md
```

上傳 signed AAB 後，建立 Closed testing track，加入測試者 email 或 Google Group。

## 11. 上傳 AAB

正式 signed AAB 產出後，上傳：

```text
release/android/trip-bill-divider-1.0.0.aab
```

如果你還沒建立 upload key，先看：

```text
ANDROID_RELEASE.md
```
