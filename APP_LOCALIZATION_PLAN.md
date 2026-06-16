# App 內多語言開發計畫

## 目標語言

第一階段建議支援：

- `zh-TW` 繁體中文
- `en` English
- `zh-CN` 简体中文
- `ko` Korean

## 建議實作方式

目前 App 是純 HTML / CSS / JavaScript。建議先用輕量 i18n 結構，不引入大型框架。

新增：

```text
locales/zh-TW.js
locales/en.js
locales/zh-CN.js
locales/ko.js
```

或集中成：

```text
i18n.js
```

資料格式：

```js
const translations = {
  "zh-TW": {
    appTitle: "輕量版生活費用分攤器",
    addMember: "新增成員"
  },
  en: {
    appTitle: "Trip Bill Divider",
    addMember: "Add member"
  }
};
```

## 語言選擇邏輯

1. 先讀使用者手動選擇的語言，存在 LocalStorage。
2. 若沒有手動選擇，使用 `navigator.language`。
3. 若不支援該語言，回退到 `zh-TW`。

## UI 建議

在頁首加入語言選單：

```text
繁中 | English | 简中 | 한국어
```

手機版可放在設定或活動頁上方。

## 注意事項

- 金額格式應跟語言分開處理，目前台幣 `$` 可以先維持。
- 分享 LINE 文字也要跟著語言切換。
- 商店文案多語言與 App 內多語言可以分開上線。
- 第一版可以先翻譯固定 UI 與提示文字，帳目/成員名稱仍由使用者自行輸入。
