# GitHub Pages 部署步驟

## 1. 建立 GitHub Repository

在 GitHub 建立一個新的 repository。建議設定：

- Visibility：Public 或 Private 都可以
- 不要勾選自動建立 README、.gitignore、license，因為本機專案已經有檔案

## 2. 啟用 GitHub Pages

進入 repository：

1. Settings
2. Pages
3. Build and deployment
4. Source 選擇 `GitHub Actions`

此專案已包含 `.github/workflows/pages.yml`，推送到 `main` 後會自動部署。

## 3. 本機接 GitHub 遠端

把 `<REPO_URL>` 換成你的 GitHub repository URL：

```bash
git remote add origin <REPO_URL>
git branch -M main
git push -u origin main
```

## 4. 取得正式網址

推送後，到 GitHub 的 Actions 頁籤查看 `Deploy GitHub Pages` 是否成功。

成功後，網址通常會是：

```text
https://<你的帳號>.github.io/<repo-name>/
```

## 5. 上架會用到的網址

隱私權政策網址通常會是：

```text
https://<你的帳號>.github.io/<repo-name>/privacy.html
```

這個網址可填入 Google Play Console 與 App Store Connect。
