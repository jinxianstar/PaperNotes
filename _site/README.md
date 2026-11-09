# PaperNotes

繁體中文優先的靜態論文閱讀知識庫。使用原生 HTML、CSS、JavaScript 與 JSON，無後端、套件安裝、付費 API 或建置步驟。

## 本機開啟

直接雙擊 `index.html` 即可離線閱讀，無需伺服器或部署。請保留整個資料夾（包含 assets）；首頁搜尋、分類、論文詳細頁與公式都可使用。離線閱讀採隨專案附上的資料快照。

### 使用 HTTP 預覽（選用）

在專案根目錄執行：

```sh
python3 -m http.server 8000
```

瀏覽 `http://localhost:8000/`。HTTP 模式讀取最新 JSON；雙擊 `file://` 模式則讀取內附離線快照。停止伺服器按 Ctrl+C。

首頁支援不分大小寫、多個空白分隔關鍵字（全部符合）的搜尋，可搜尋標題、作者、年份、場域、分類、標籤與各段筆記。搜尋與分類採交集；按「重設」恢復全部收藏。HTTP 模式由 `data/papers.json` 載入，直接開檔則使用由同一份 JSON 產生的離線快照，詳細頁共用 `paper.html?slug=<slug>`。

## 檔案

- `index.html`：首頁、搜尋與分類介面。
- `paper.html`：共用詳細頁。
- `assets/css/style.css`：手機與桌面版樣式。
- `assets/js/app.js`：卡片、搜尋與篩選。
- `assets/js/paper.js`：詳細頁、章節與來源。
- `assets/js/data.js`：共用載入、資料驗證與安全 DOM 工具。
- `data/papers.json`：唯一論文資料來源。
- `.github/workflows/deploy-pages.yml`：GitHub Pages 部署。

## 新增論文

1. 完整閱讀 `AGENTS.md`。先查證原文或作者／出版單位官方來源；不可臆測作者、DOI 或實驗結果。
2. 在 JSON 陣列尾端新增一個物件，保留既有資料及 slug。slug 使用唯一的小寫英文與連字號；公開後保持穩定。
3. 每篇必須有下列全部欄位：

| 欄位 | 格式與規則 |
| --- | --- |
| `slug` | 唯一 lowercase-kebab-case 字串 |
| `title` | 正式英文原題 |
| `authors` | 作者姓名字串陣列，至少一人，必須查證 |
| `year` | 查證過的出版年份整數 |
| `venue` | 已查證期刊／會議名稱，否則 `Unverified` |
| `doi` | 已查證的 `https://doi.org/10.…`，否則空字串 |
| `url` | 已查證公開原文／官方頁面的 HTTP(S) URL，否則空字串 |
| `category` | `Image Processing`、`Networking`、`AI & ML`、`Other` 之一 |
| `tags` | 短字串陣列 |
| `summary` | 繁中摘要 |
| `motivation` | 繁中研究背景與動機 |
| `method` | 繁中核心方法 |
| `experiments` | 繁中實驗設計與研究結果；未核對時明確說明 |
| `limitations` | 繁中優點、限制及推論界線 |
| `takeaways` | 繁中閱讀反思／個人筆記，與作者結論區分 |
| `status` | `verified` 或 `draft`；仍有未查證內容用 `draft` |

4. 文字欄位可用 `\n\n` 分段。`experiments` 可使用 `實驗設計：\n…\n\n研究結果：\n…`；`limitations` 可使用 `優點：\n…\n\n限制：\n…`，詳細頁會顯示子標題。不接受 HTML；一般內容以純文字呈現，另支援下述有限公式與表格格式。
5. 固定章節順序為：基本資訊、摘要、研究背景、核心方法、實驗設計與研究結果、優點與限制、個人筆記、參考來源。無需修改 HTML 或 JavaScript。
6. 檢查 JSON、slug 唯一性、卡片、關鍵字搜尋、分類交集、詳細頁、未知 slug、320px 手機版與來源連結。

可用 `python3 -m json.tool data/papers.json` 檢查 JSON 語法。網站載入時也會驗證必要欄位與唯一 slug；資料錯誤會顯示載入說明，不會輸出部分損壞資料。來源 URL 限 HTTP(S)，資料文字只經由 DOM API／textContent 呈現。

## 目前收錄與查證界線

目前收錄 references/ 匯入的 5 篇論文；兩篇早期示範筆記已依使用者要求刪除。各篇來源、頁碼與待查證事項見筆記及 `import-report.md`，來源對應見 `data/import-manifest.json`。

## GitHub Pages 部署

1. 在 GitHub 建立儲存庫，將本目錄內容提交至 `main` 分支並推送。若使用其他預設分支，修改 workflow 的 `branches`。
2. 前往儲存庫 **Settings → Pages → Build and deployment → Source**，選擇 **GitHub Actions**。
3. 推送 `main` 或在 **Actions → Deploy GitHub Pages → Run workflow** 手動啟動。
4. workflow 只複製公開頁面、assets、data 與 README 到部署 artifact；不會發布 AGENTS.md 或 GitHub 設定。成功後網址顯示於 workflow 的 `github-pages` environment。
5. 通常網址為 `https://USERNAME.github.io/REPOSITORY/`。所有網站資產、JSON fetch 與頁面導覽均為相對路徑，支援儲存庫子路徑。不需要設定 base URL。

部署需要儲存庫啟用 Pages 與 Actions，且帳號／儲存庫方案允許 Pages。本目錄不包含遠端連線或帳號憑證；提供部署設定不代表已上線。

也可採用 **Deploy from a branch → main / (root)**，不啟用 Actions workflow；勿同時使用兩種部署方式。

## 驗證清單

以本機 HTTP 伺服器驗證所有卡片、大小寫搜尋、分類及搜尋交集、空結果與重設、所有詳細網址、固定章節順序、缺少／未知 slug、JSON 404 或格式錯誤、320px 手機無水平溢出、桌面排版與鍵盤焦點。部署前也應於儲存庫子路徑下重測。

## 本次驗證紀錄（2026-11-09）

- 通過：三個 JavaScript 模組的 Node 語法檢查；JSON 解析、全部必要欄位與唯一 slug。
- 通過：大小寫搜尋、多關鍵字、分類交集、空結果、重設及不安全 URL 拒絕。
- 通過：瀏覽器 HTTP 載入兩篇筆記、八個固定章節、缺少與未知 slug 提示、返回收藏連結。
- 通過：320px 首頁與詳細頁無水平溢出；1280px 桌面首頁雙欄排版。
- 通過：以 /PaperNotes/ 子路徑載入首頁、JSON、資產與詳細頁。
- 通過：獨立測試副本中 JSON 404 與格式錯誤均顯示易懂訊息；正常頁面未觀察到 console error／warning。
- 尚未執行：GitHub Actions 遠端部署（目前目錄尚非 Git 儲存庫，未提供遠端）；完整跨瀏覽器與螢幕閱讀器稽核。

部署流程參考 [GitHub 官方自訂 Pages workflow 文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 批次匯入本機 PDF

將新 PDF 放在本機 `references/` 或其子資料夾，再請 AI「依 AGENTS.md 第 10 節批次匯入 references」。AI 必須逐頁讀取及檢視表格／公式，按 DOI／正規化標題更新或新增，保留既有 slug。這是 AI 執行的可重複流程，單純放入 PDF 不會自動背景匯入。

- `data/import-manifest.json` 記錄來源路徑、SHA-256、頁數、已讀頁面與對應 slug。
- `node scripts/validate-papers.mjs` 檢查 Schema、重複資料、標題與分類搜尋、本機 PDF 涵蓋與雜湊、安全呈現及發布排除。此命令驗證紀錄一致性，不能證明 AI 摘要正確；仍需依頁碼人工核對。
- `import-report.md` 記錄本批處理與瀏覽器測試結果。
- 原文未提供的內容明示「原文未提供」；歧義明示「待查證」。作者結論與 AI 分析分開，尚有實質疑點者為 `draft`。
- 首批 4 篇與後續新增 1 篇均依 PDF 整理；依使用者要求移除早期兩篇示範筆記，目前總計 5 篇。

`/references/` 已忽略，原始 PDF、全文擷取與頁面影像不進公開網站。Actions 採明確檔案白名單；若來源曾被 Git 追蹤，gitignore 不會自動移除索引，驗證會阻擋並要求處理。不要強制加入來源 PDF，也不要將整個目錄直接當成發布 artifact。

## 公式與重複內容

詳細頁以瀏覽器原生 MathML 顯示公式，無 CDN、付費 API 或新增套件。在文字欄位中，用獨立行的 `$$…$$` 標記公式；支援分數 `\frac{a}{b}`、平方根 `\sqrt{x}`、上下標、求和與本批資料使用的希臘字母。這是有限語法，不是完整 LaTeX；不支援的語法會保留文字供核對。正文與來源頁碼放在公式區塊外。長公式在自身區塊左右捲動，避免手機整頁溢出。

同一章節的重複小標題與完全相同段落只顯示一次；來源網址相同時只保留一個連結。不同論文不因主題接近而刪除；資料去重依 DOI、題名、slug 驗證。

公式測試：`node scripts/test-math.mjs`，涵蓋全部現有公式、巢狀分數與上下標，以及不支援語法和純文字安全後備；發布前會與資料驗證一同執行。

## 維護離線快照

修改 `data/papers.json` 或共用 JavaScript 模組後，執行 `node scripts/sync-offline.mjs`，一起提交產生的 `assets/js/offline.js`。`node scripts/sync-offline.mjs --check` 檢查快照一致性，CI 也會執行。這是編輯者同步資料的步驟；讀者直接開 HTML 即可。請勿手動維護兩套論文資料。

## 實驗表格

筆記的文字欄位可使用 `表格：標題與 PDF 頁碼`，下一行開始接 pipe table（`| 欄位 | 數值 |`、`| --- | --- |` 及資料列）。共用模板會建立帶 caption、欄標題與列標題的 HTML 表格；保留原始數值、單位與來源。長表格只在自身區塊左右捲動。資料列數量與欄數不符時保留純文字，避免錯位。這是安全的有限格式，不接受任意 HTML。更新後記得執行 `node scripts/sync-offline.mjs`。
