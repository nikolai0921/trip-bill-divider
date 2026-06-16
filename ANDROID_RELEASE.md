# Android Release 流程

## 目前狀態

- Android package id：`io.github.nikolai0921.tripbilldivider`
- App 顯示名稱：`輕量版生活費用分攤器`
- `versionCode`：`1`
- `versionName`：`1.0.0`
- Android debug build 已成功
- Android release App Bundle 已可產生
- AndroidManifest 已移除 `INTERNET` 權限

目前本機已產生：

```text
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/bundle/release/app-release.aab
```

注意：正式上傳 Google Play 前，release bundle 需要使用你的 upload key 簽章。

## 1. 建立 upload key

在專案根目錄執行，並自行設定安全密碼：

```powershell
keytool -genkeypair `
  -v `
  -keystore android/upload-keystore.jks `
  -storetype JKS `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -alias upload
```

請妥善保存：

- `android/upload-keystore.jks`
- keystore 密碼
- key alias
- key 密碼

這些資料遺失會影響日後更新 App。

## 2. 建立本機 keystore 設定

建立 `android/keystore.properties`：

```properties
storeFile=upload-keystore.jks
storePassword=你的_keystore_密碼
keyAlias=upload
keyPassword=你的_key_密碼
```

`android/keystore.properties` 與 keystore 檔案已被 `.gitignore` 排除，不要提交到 GitHub。

## 3. 產生正式 AAB

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
cd android
.\gradlew.bat bundleRelease
```

輸出檔：

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## 4. Google Play Console

上傳 `.aab` 到 Google Play Console 的測試軌或正式軌。

需要準備：

- App 名稱
- App 描述
- App icon
- 手機截圖
- 隱私權政策網址：`https://nikolai0921.github.io/trip-bill-divider/privacy.html`
- Data Safety 表單
- 內容分級問卷
- 測試人員或測試群組
