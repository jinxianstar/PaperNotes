# PDF 批次匯入報告

日期：2026-11-09。使用本機 PDF 為主要證據；沒有使用網路摘要代替全文，也沒有重現研究實驗。

## 處理總覽

- 遞迴掃描 `references/`：4 個 PDF，共 32 頁；各檔案全部頁面皆已讀取文字並檢視頁面概覽，重要公式與表格另以原頁影像核對。
- 成功匯入：4 篇新增；更新既有論文：0 篇；保留原先 2 篇及其 slug，總計 6 篇。
- 無解析失敗或遺漏。低光論文的表格在文字擷取中缺失，已由頁面影像補讀；旋轉文字警告涉及頁邊文字，正文及關鍵表格另以渲染核對。
- 四篇新筆記均為 `draft`：基本出版資訊與列出的數據已依 PDF 核對，但各有待澄清的實質方法或解讀問題。不能將成功匯入等同於研究已重現或毫無疑點。
- 檔案、SHA-256、頁面覆蓋與 slug 對應見 `data/import-manifest.json`。

## 來源與對應筆記

| 本機 PDF（references/ 下） | 頁數 | 分類 | 處理 |
| --- | ---: | --- | --- |
| A_Framework_for_Robust_Network_Traffic_Prediction_Using_Multi-Scale_Adversarial_Training_and_an_Online_Adaptive_Mechanism.pdf | 6 | Networking | 新增，draft |
| A_Simple_Yet_Robust_Nonlinear_Function_for_Low-Light_Image_Enhancement_Task.pdf | 5 | Image Processing | 新增，draft |
| LARSI-TPE-XGB_Short-Term_Load_Forecasting_by_Load-Adaptive_Relative_Strength_Index_and_Fusion_of_Tree-Structured_Parzen_Estimator_and_XGBoost.pdf | 13 | AI & ML | 新增，draft |
| Two-Phase_Positioning_System_Based_on_the_Fusion_of_Wi-Fi_Signal_Strength_and_Pose_Estimation.pdf | 8 | Networking | 新增，draft |

詳細頁：

- [Network traffic / multi-scale AT + DMA](paper.html?slug=a-framework-for-robust-network-traffic-prediction-using-multi-scale-adversarial-training-and-an-online-adaptive-mechanism)
- [Low-light enhancement / HSV3](paper.html?slug=a-simple-yet-robust-nonlinear-function-for-low-light-image-enhancement-task)
- [LARSI-TPE-XGB](paper.html?slug=larsi-tpe-xgb-short-term-load-forecasting-by-load-adaptive-relative-strength-index-and-fusion-of-tree-structured-parzen-estimator-and-xgboost)
- [Two-phase positioning](paper.html?slug=two-phase-positioning-system-based-on-the-fusion-of-wi-fi-signal-strength-and-pose-estimation)

上述連結在 Markdown 支援相對連結的檢視器中可使用；網站詳細頁仍共用同一 HTML，不另建論文頁。

## 待查證事項

| 論文 | 主要未決事項與來源 |
| --- | --- |
| Network traffic | PDF 第 2–4 頁：黑箱設定、FGSM 梯度可得性／代理模型、training-stream 敘述與 inference-only 範圍；δ、TCN 細節及百分比換算未完整提供。Algorithm 1 的標籤可用性是上線條件。 |
| Low-light | 第 2–3 頁：式 (8) 與固定 M 的式 (9) 不可無條件互換；三次迭代的感知近似不能當通用定理。Table I 的 PSNR/MSE 排序及聚合尺度未說明；全黑正規化、執行時間、逐組樣本數原文未提供。 |
| LARSI | 第 6–11 頁：Down 符號與 RSI 範圍、SG 因果計算與下一日溫度是否預報、DM 方向與校正、50 次 TPE 與 Fig. 7 到 100 trials 的對應；瑞士文字日期與 Table IV 範圍不同。 |
| Positioning | 第 4、8 頁：腳點流程圖與正文關節分支、配對距離不等式；多人配對正確率及一對一衝突策略原文未提供。0.43 m 為 Table IV 影像定位結果，不是身分配對準確率。 |

筆記明確區分作者原始結論、原文限制、AI 補充分析及待查證內容。作者姓名依首頁，低光論文保留縮寫，不猜測全名。數值均標 PDF 檔案頁碼（第一頁為 1），並附 Table／Fig.／式編號；部分亦附刊載頁碼。

## 網站與驗證

全部以下檢查已通過：

- `node scripts/validate-papers.mjs`：6 筆完整 Schema，slug／正規化題名／DOI 無重複；4 個 PDF 路徑、SHA-256、32 頁已讀紀錄與對應筆記一致。以匯入前快照逐物件比較，既有兩篇內容完全未變。
- 三個前端 JavaScript 模組及驗證腳本通過 Node 語法檢查。
- 本機 HTTP 瀏覽器：6 篇逐篇輸入大寫完整標題，均只得到該篇；分類分別為 Image Processing=3、Networking=2、AI & ML=1、Other=0；搜尋與分類交集、空結果及重設正常。
- 6 個詳細頁逐篇檢查：桌面 1280px 與手機 320px 均顯示 Metadata → Summary → Motivation → Method → Experiments → Limitations → Takeaways → Sources，沒有水平溢出。
- `/PaperNotes/` 子路徑下首頁、JSON、資產與全部 6 個詳細路由正常；手機亦無水平溢出。
- 缺少／未知 slug 顯示找不到論文；獨立測試副本中的 JSON 404（首頁）與錯誤 Schema（詳細頁）顯示易懂載入錯誤。正常載入流程未觀察到 console error／warning。
- 已目視核對低光筆記的公式、表格轉述、來源頁碼與章節導覽；原文表格未作成網站圖片或上傳。共用模板用安全 DOM API 呈現文字，保留原有固定章節順序。
- 本次依部署白名單建立的 `_site/` 檔案清單沒有 PDF 或 references；`/references/` 已忽略。workflow 增加發布前資料驗證。

測試限制：僅本機瀏覽器，未做跨瀏覽器／完整螢幕閱讀器稽核；未在 GitHub 遠端執行 Actions、未重現四篇論文實驗。

## 原始 PDF 的公開排除

`/references/` 已加入 `.gitignore`。部署以 `index.html`、`paper.html`、README／報告、`assets/`、`data/` 白名單建立 `_site/`，不複製 PDF、全文擷取或頁面影像；公開來源只連到 DOI／官方頁面。當前目錄沒有 `.git`，沒有可供清理的既有 Git 索引，也未執行遠端發布。未來建立儲存庫時不可強制加入 references；驗證器會在有 Git 索引時檢查已追蹤來源。

## 異動檔案

- 更新 `data/papers.json`：新增四篇原文筆記，既有兩篇不變。
- 更新 `assets/js/paper.js`：在既有固定章節內辨識研究貢獻、重要公式、作者限制、AI 分析等子標題，仍使用 DOM API 安全呈現。
- 更新 `AGENTS.md`、`README.md`：納入完整批次匯入規則與操作方法。
- 更新 `.gitignore`、`.github/workflows/deploy-pages.yml`：忽略原始來源，發布前驗證並維持公開檔案白名單。
- 新增 `data/import-manifest.json`、`scripts/validate-papers.mjs`、`import-report.md`：來源追蹤、可重跑檢查與本次報告。
- 無新增網站套件、後端、建置步驟或逐篇硬編碼 HTML。

## 顯示去重與公式修正（2026-11-09）

- 再次確認六篇沒有重複 DOI、正規化題名或 slug，因此保留六篇不同論文。
- 移除詳細頁重複顯示的小標題、同章完全相同段落與相同網址來源連結；不刪除不同的實驗結果。
- 將 31 個主要公式改為原生 MathML 區塊，支援分數、根號、上下標與求和；保留原有數據、原文疑點與頁碼，不重新推定論文結論。手機長公式只在區塊內捲動，整頁不溢出。
- 更新 data/papers.json、assets/js/paper.js、assets/css/style.css、README、資料驗證與 workflow；新增 assets/js/math.js 及 scripts/test-math.mjs，無外部套件或 CDN。
- 已通過：31 個公式語法及 DOM 結構／安全後備測試，六篇桌面 1280px 與手機 320px 詳細頁，八個章節、無重複小標／來源、無水平溢出、無公式 fallback；正常頁面沒有 console error／warning。資料 Schema 與 PDF 覆蓋驗證亦通過。

## 直接開啟 HTML（2026-11-09）

依使用者要求新增 file:// 離線入口：index.html、paper.html 改以 boot.js 選擇載入方式。HTTP 保留 JSON fetch／原共用模組；本機檔案使用由同一份 JSON 與模組產生的 offline.js。無新增套件、部署或讀者端建置需求。新增 sync-offline.mjs 與 test-offline.mjs，更新 AGENTS、README 及 CI 快照一致性檢查。

已通過離線模式 VM 測試：6 篇卡片、大小寫搜尋、分類交集、重設、6 個詳細頁、31 個 MathML 公式、未知 slug；測試禁止 fetch，確認離線流程無網路依賴。HTTP 瀏覽器也確認 6 篇首頁、搜尋及詳細頁／公式正常，無 console error。測試限制：內建瀏覽器政策不允許 file://，因此未在真實瀏覽器直接開檔測試；以離線啟動及 DOM 程式測試驗證，未規避瀏覽器政策。

## 移除兩篇示範筆記（2026-11-09）

依使用者截圖明確指定，刪除 Learning a Deep Convolutional Network for Image Super-Resolution 與 Learning Deep CNN Denoiser Prior for Image Restoration。現在僅保留本機 PDF 匯入的四篇；來源 manifest 不受影響。同步重產離線快照及更新 README／離線測試，兩個已刪除網址會顯示找不到論文。前文六篇相關紀錄為當時歷史狀態。

## 實驗數據表格化（2026-11-09）

依使用者指出的 LARSI 閱讀問題，把 Table V 拆為 ENTSO-E／Spain 兩張具單位的誤差表，Table VI、Table VII 節錄、Table VIII 與 Fig. 8 節錄分別成表，共六張。保留既有數值、p-value、頁碼及待查證內容，將閱讀重點放於各表下方。共用安全 DOM 模板支援有限 pipe-table 格式，無新增套件。更新 JSON、共用內容渲染、CSS、README、測試及離線快照。

已驗證六張表的欄列結構、Table V/VIII 全部指標值、p-value 與安全文字呈現；離線測試確認六張表及全部四篇詳細頁／31個公式正常。瀏覽器桌面與320px手機檢查無整頁水平溢出；手機表格可在自身區塊左右捲動，欄標／列標使用 scope，正常頁面無 console error。

## 其餘三篇實驗表格化（2026-11-09）

補齊網路流量、低光影像與室內定位三篇先前未處理的數據排版。網路流量為 UECE／CERNET Table II 及 Table I 節錄，共3張；低光影像為 LOLv1/LIME消融與U/P比較，共4張；室內定位為Wi-Fi、影像定位與正文誤差分布，共3張。與LARSI原有6張合計16張。數據、單位、來源頁碼、節錄範圍與待查證內容保留；離線快照同步更新。

本次補齊後驗證：四篇共16張表格，分別3/4/6/3張；桌面1280px及手機320px逐篇確認八個章節、表格欄數一致、無整頁溢出，正常頁面無console error。離線DOM測試亦逐篇核對表格數量。另以轉換前快照比對三篇實驗段落，原有數字字面值均保留；31個公式、Schema、來源覆蓋與離線同步檢查通過。

## 增量匯入：ISCC 2025 TCN／NNCT（2026-11-09）

- 遞迴掃描 references/ 共5份PDF。4份既有來源SHA-256與manifest一致，直接略過；新增1份6頁，無解析失敗。
- 新增：Enhancing Internet Traffic Prediction Accuracy Using an Ensemble Approach with a Novel Weight Integration Method and Temporal Convolutional Networks，Jin-Xian Liu、Jenq-Shiou Leu，2025 IEEE Symposium on Computers and Communications (ISCC)，DOI 10.1109/ISCC65549.2025.11325775。題名、作者、年份、場域與DOI均核對PDF第1頁。與現有資料的DOI及正規化標題無重複。
- 完整讀取第1–6頁文字並檢視渲染；核對Fig.1–3、Table I–IV及式(1)–(5)。新增3張具來源頁碼的表格，包含12列單一模型比較與5列權重方法結果；6個MathML區塊呈現原公式（式3的目標與邊界分開顯示）。不發布原始PDF或頁面影像。
- 標為draft：式(2)的負權重誤差加總與aggregate MSE的關係、m/N/n記號、部分改善比例與lag比較基準、SD=0的實驗重複範圍及完整模型設定需查證。保留原值與作者結論，另列AI分析，不自行修正。
- 資料庫由4篇增為5篇。只新增一個物件與來源manifest項目，既有四篇內容及slug不得改動；另同步離線快照、更新目前收錄數與使測試支援新筆記數量。

本批測試結果：

- 通過：5個PDF來源覆蓋與SHA-256、Schema、唯一slug／正規化標題／DOI。
- 通過：與匯入前快照深度比較，既有四篇的所有欄位及slug完全未變。
- 通過：5篇離線卡片與詳細頁、搜尋／分類／重設；共37個MathML公式、19個來源標示表格，沒有解析fallback；新筆記12列基礎模型結果與最終NNCT數值核對。
- 通過：HTTP /PaperNotes/子路徑下新題名不分大小寫搜尋、Networking篩選、跨分類空結果、重設；分類數量Networking=3、Image Processing=1、AI & ML=1。首頁卡片及返回收藏連結實際點擊正常。
- 通過：桌面1280px與手機320px逐篇開啟全部5篇，均顯示8個固定章節、預期表格數量及公式，無整頁水平溢出、正常流程無console error／warning。
- 通過：公開預覽檔案沒有PDF或references；離線快照與JSON／共用模組一致。
- 限制：內建瀏覽器政策禁止file://，雙擊模式以VM／DOM無網路測試驗證，沒有宣稱真實瀏覽器開檔測試；未重現論文模型，未執行GitHub遠端部署。
