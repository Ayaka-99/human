# 開發執行日記
> 人類觀測站 Web — 每次實作後記錄，方便下次快速接手

---

## 2026-03-30 — 主題切換（Theme Toggle）

**目標：** 加入明暗切換，預設跟隨系統，偏好存 localStorage

**設計文件：** `docs/superpowers/specs/2026-03-30-theme-toggle-design.md`
**實作計畫：** `C:\Users\ayaka\.claude\plans\cosmic-finding-castle.md`

### 完成項目

| # | 內容 | 檔案 |
|---|------|------|
| 1 | 安裝 next-themes ^0.4.6 | `human-observatory-web/package.json` |
| 2 | 建立 Tailwind 設定，`darkMode: 'class'` | `human-observatory-web/tailwind.config.ts`（新建） |
| 3 | 替換 globals.css：專案設計 token（:root 深色 + .light 白色覆蓋） | `human-observatory-web/src/app/globals.css` |
| 4 | layout.tsx：加 ThemeProvider + suppressHydrationWarning + 語言改 zh-TW | `human-observatory-web/src/app/layout.tsx` |
| 5 | 新增 ThemeToggle 元件（☀️/🌙 按鈕，mounted 防 SSR mismatch） | `human-observatory-web/src/components/ui/ThemeToggle.tsx`（新建） |
| 6 | 新增 Navbar（品牌名 + 導航連結 + ThemeToggle 右上角） | `human-observatory-web/src/components/layout/Navbar.tsx`（新建） |
| 6b | layout.tsx 加入 `<Navbar />` | `human-observatory-web/src/app/layout.tsx` |
| 7 | WorldHeatmap 無數據顏色（元件尚未建立，待日後實作時處理） | — |
| 8 | 更新規格：CLAUDE.md rule #8、SPEC_WEB.md §3 目錄 + §4 CSS token | `spec-web/CLAUDE.md`, `spec-web/SPEC_WEB.md` |

### 注意事項（下次接手要知道）

- `tailwind.config.ts` 是**手動建立**的（create-next-app 這次沒生成），內容完整
- Next.js 版本是 **16.2.1**（不是 14，規格書寫的是 14 但實際裝的是 16，功能相容）
- WorldHeatmap 實作時記得：no-data 填色改用 `getComputedStyle` 讀 `--border` 變數，並在 useEffect 依賴陣列加 `theme`
- answer colors（--answer-a ~ e）在白色模式下需跑 Lighthouse Accessibility 確認 WCAG AA 對比度

### 驗證方式

```bash
cd human-observatory-web
npm run dev
# → 開 localhost:3000，Navbar 右上角應有 ☀️/🌙 按鈕
# → 點擊切換，背景在 #080C10 與 #F0F4F8 之間切換
# → 重新整理，主題應保持不變（localStorage）
```

---

## 2026-03-30 — Day 2：首頁題目顯示（靜態假資料）

**目標：** 首頁顯示題目卡片，靜態假資料版，點選後導向結果頁空殼

### 完成項目

| # | 內容 | 檔案 |
|---|------|------|
| 1 | 定義 Question、QuestionOption 型別 | `src/types/index.ts`（新建） |
| 2 | 建立靜態假資料 | `src/lib/mockData.ts`（新建） |
| 3 | 新增 QuestionCard 元件（選項選擇 + 提交） | `src/components/question/QuestionCard.tsx`（新建） |
| 4 | 更新首頁，顯示 QuestionCard | `src/app/page.tsx` |
| 5 | 結果頁空殼（Day 3 填內容） | `src/app/results/[questionId]/page.tsx`（新建） |

### 注意事項（下次接手要知道）

- 假資料在 `src/lib/mockData.ts`，Day 3 接 Supabase 時整個替換
- 結果頁用 `searchParams.answer` 暫存選擇，Day 3 改為從 DB 讀
- `params` 和 `searchParams` 在 Next.js 16 是 Promise 型別，需 `await`
- QuestionCard 提交目前無 API 呼叫，直接 router.push

### 驗證方式

```bash
cd human-observatory-web
npm run dev
# → localhost:3000 顯示題目卡片
# → 選擇選項後按送出，跳轉到結果頁
# → 明暗切換正常
```

---

## 2026-03-30 — Day 3：Supabase 整合 + 回答提交 + 結果頁統計

**目標：** 接上真實資料庫，提交答案寫入 Supabase，結果頁顯示即時統計分佈

### 完成項目

| # | 內容 | 檔案 |
|---|------|------|
| 1 | Supabase browser/server client | `src/lib/supabase/client.ts`、`server.ts`（新建） |
| 2 | 新增 DailyStats 型別 | `src/types/index.ts` |
| 3 | 首頁改從 Supabase 讀今日題目（含 mock fallback） | `src/app/page.tsx` |
| 4 | POST /api/submit-answer（寫入 answers + 更新 daily_stats） | `src/app/api/submit-answer/route.ts`（新建） |
| 5 | QuestionCard 改呼叫真實 API | `src/components/question/QuestionCard.tsx` |
| 6 | 結果頁顯示各選項百分比長條 | `src/app/results/[questionId]/page.tsx` |

### 注意事項（下次接手要知道）

- Supabase URL + anon key 在 `.env.local`（不進 git）
- 首頁有 fallback：Supabase 沒有今日題目時自動用 mockData
- `daily_stats` upsert 用 `onConflict: 'question_id'`，需要 UNIQUE 約束
- region 目前存 'UNKNOWN'，Day 5 接 WorldHeatmap 時改用 `x-vercel-ip-country` header
- 結果頁是 Server Component，每次進頁面重新 fetch（無 Realtime，Day 4 加）

### 驗證方式

```bash
cd C:\Users\ayaka\Downloads\human_obversation\human-observatory-web
npm run dev
# → 選答案送出 → 結果頁有統計 → Supabase dashboard 確認 answers 表有資料
```

---

## 2026-03-30 — Day 4：動畫 + 圓餅圖 + Realtime

**目標：** 結果頁加入揭曉動畫、Recharts 圓餅圖、CounterBadge 數字滾動，Supabase Realtime 即時更新

### 完成項目

| # | 內容 | 檔案 |
|---|------|------|
| 1 | 安裝 framer-motion、recharts | `package.json` |
| 2 | useGlobalResults hook（Supabase Realtime 訂閱） | `src/hooks/useGlobalResults.ts`（新建） |
| 3 | CounterBadge（requestAnimationFrame 數字滾動） | `src/components/charts/CounterBadge.tsx`（新建） |
| 4 | GlobalPieChart（Recharts，用戶選項突出，SVG 用 hex，CSS 用 var） | `src/components/charts/GlobalPieChart.tsx`（新建） |
| 5 | RevealAnimation（Framer Motion 揭曉序列） | `src/components/question/RevealAnimation.tsx`（新建） |
| 6 | ResultsClient（'use client' 動畫 + Realtime） | `src/components/results/ResultsClient.tsx`（新建） |
| 7 | 結果頁重構（Server Component 僅 SSR fetch + Promise.all） | `src/app/results/[questionId]/page.tsx` |

### 注意事項（下次接手要知道）

- Supabase Realtime 需在 Dashboard 啟用 `daily_stats` 表的 Replication（Realtime → Tables → Enable Realtime）
- RevealAnimation 用 `className="reveal-item"` 做 stagger 選擇器（不用 id，避免重複）
- GlobalPieChart SVG Cell fill 用 hex（`ANSWER_HEX`），非 SVG 用 CSS var（`ANSWER_COLOR`）— Recharts SVG 無法解析 CSS 變數
- 結果頁 Server Component 用 `Promise.all` 並行 fetch 兩個 query，降低延遲
- hooks/ 目錄不加 `'use client'`，由使用該 hook 的 Client Component 提供 client boundary

### 驗證方式

```bash
cd c:/Users/ayaka/Downloads/human_obversation/human-observatory-web
npm run dev
# → localhost:3000 選答案送出
# → 結果頁：teal flash → 地球 → 數字從 0 滾動到正確值 → 圓餅圖動畫 → 長條圖逐一淡入
# → 另開分頁再送一票，原頁面數字應即時更新（Realtime）
# → 切換明暗主題，圓餅圖顏色保持正確（CSS vars）
```

---

## 2026-03-30 — Day 5：WorldHeatmap + TimeHeatmap + PremiumGate

**目標：** 結果頁加入 D3 世界地圖熱力圖、時段熱力圖，並用 PremiumGate 元件鎖定進階功能

**實作計畫：** `docs/superpowers/plans/2026-03-30-day5-worldheatmap-timeheatmap-premiumgate.md`

### 完成項目

| # | 內容 | 檔案 |
|---|------|------|
| 1 | 安裝 d3、topojson-client | `human-observatory-web/package.json` |
| 2 | DailyStats 新增 region_breakdown、time_breakdown | `src/types/index.ts` |
| 3 | ALPHA2_TO_NUMERIC + NUMERIC_TO_NAME 對照表 | `src/lib/countryCode.ts`（新建） |
| 4 | PremiumGate 元件（模糊鎖定層） | `src/components/ui/PremiumGate.tsx`（新建） |
| 5 | WorldHeatmap（D3 SVG，選項切換，hover tooltip，fetch 錯誤處理） | `src/components/charts/WorldHeatmap.tsx`（新建） |
| 6 | TimeHeatmap（CSS Grid，24h × 5 選項，React.Fragment key 修正） | `src/components/charts/TimeHeatmap.tsx`（新建） |
| 7 | submit-answer API 加入 region 偵測 + time_breakdown 聚合 + JSON 錯誤處理 | `src/app/api/submit-answer/route.ts` |
| 8 | ResultsClient 整合 WorldHeatmap + TimeHeatmap + PremiumGate | `src/components/results/ResultsClient.tsx` |

### 注意事項（下次接手要知道）

- PremiumGate 的 `locked` prop 預設 `true`（MVP 全鎖）；未來接 auth 時改為判斷 `user.isPremium`
- WorldHeatmap topology 只從 `cdn.jsdelivr.net/npm/world-atlas@2` 取得（CLAUDE.md rule #11）
- `ALPHA2_TO_NUMERIC` 目前涵蓋約 55 個國家；新增國家在 `src/lib/countryCode.ts` 補充
- submit-answer API 在本地開發時 `x-vercel-ip-country` 不存在，region 存 `UNKNOWN`，region_breakdown 會跳過這些記錄（地圖上不會顯示本地測試的票數）
- `daily_stats` 的 `region_breakdown` 和 `time_breakdown` 是 JSONB 欄位，需確認 Supabase 已建立這兩個欄位（若未建立，upsert 會靜默忽略）
- TimeHeatmap 在 React Fragment 使用 `<React.Fragment key={opt.key}>` 而非 `<>`，避免 reconciliation 問題

### Supabase schema 補充

若 `daily_stats` 表尚未有 `region_breakdown` 和 `time_breakdown` 欄位，執行：
```sql
ALTER TABLE daily_stats
  ADD COLUMN IF NOT EXISTS region_breakdown JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS time_breakdown   JSONB DEFAULT '{}';
```

### 驗證方式

```bash
cd c:/Users/ayaka/Downloads/human_obversation/human-observatory-web
npm run dev
# → localhost:3000 選答案送出
# → 結果頁捲到底：WorldHeatmap 被模糊 + 🔒「世界地圖分佈」
# → TimeHeatmap 被模糊 + 🔒「時段熱力圖」
# → 明暗切換後，PremiumGate 背景隨主題變色
```

---

## 2026-03-31 — Day 6：歷史紀錄

**目標：** 用 localStorage 記錄答題歷史，/history 頁顯示清單，點擊跳到結果頁

### 完成項目

| # | 內容 | 檔案 |
|---|------|------|
| 1 | localStorage 讀寫工具（getHistory、saveHistory、clearHistory） | `src/lib/history.ts`（新建） |
| 2 | QuestionCard submit 成功後寫入歷史 | `src/components/question/QuestionCard.tsx` |
| 3 | /history 列表頁（Client Component，含 skeleton + 空狀態） | `src/app/history/page.tsx`（新建） |

### 注意事項（下次接手要知道）

- localStorage key 是 `ho_history`，格式為 `HistoryEntry[]`（最新在前）
- 同一 `question_id` 只存一筆（去重在 `saveHistory` 內處理）
- history 頁用 `mounted` state 防止 SSR hydration mismatch（localStorage 只在 client 存在）
- Navbar 的「歷史紀錄」連結早已存在，不需修改
- 未實作：分享按鈕、AdSense、特質標籤（Day 6 B 計畫，之後補）

### 驗證方式

```bash
cd c:/Users/ayaka/Downloads/human_obversation/human-observatory-web
npm run dev
# → 答一題送出 → 結果頁正常
# → 點 Navbar「歷史紀錄」→ 看到剛才那筆紀錄
# → 點紀錄 → 跳到結果頁
# → 重新整理歷史頁，紀錄仍在
```

---

## 2026-03-31 — Day 7：個人頁（統計總覽）

**目標：** `/profile` 頁顯示總答題數（英雄橫幅）+ 最近 12 週答題日曆熱圖，資料全來自 localStorage

**設計文件：** `docs/superpowers/specs/2026-03-31-profile-design.md`
**實作計畫：** `docs/superpowers/plans/2026-03-31-profile.md`
**PR：** [Ayaka-99/human#1](https://github.com/Ayaka-99/human/pull/1)

### 完成項目

| # | 內容 | 檔案 |
|---|------|------|
| 1 | ActivityCalendar 元件（7×12 CSS Grid，台北時區 UTC anchor 日期計算） | `src/components/charts/ActivityCalendar.tsx`（新建） |
| 2 | /profile 頁面（英雄橫幅 + ActivityCalendar，SSR skeleton） | `src/app/profile/page.tsx`（新建） |
| 3 | Timezone bug fix：buildCells 改用 UTC arithmetic 避免非台北時區日期錯位 | `src/components/charts/ActivityCalendar.tsx` |

### 注意事項（下次接手要知道）

- 日曆 date 字串格式：先用 `toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })` 取今天的台北日期，再 parse 為 UTC midnight，用 `setUTCDate` 往回推，最後 `toISOString().slice(0, 10)` 取出 YYYY-MM-DD
- 這樣產生的日期字串與 `history.ts` 的 `HistoryEntry.date`（台北時間 YYYY-MM-DD）一致，`answeredDates.has(date)` 才能正確 match
- Navbar 的「個人頁」連結早已存在，不需修改
- 未實作：連續答題天數（streak）、選項偏好分佈、登入同步

### 驗證方式

```bash
cd c:/Users/ayaka/Downloads/human_obversation/human-observatory-web
npm run dev
# → localhost:3000/profile
# → 英雄橫幅：teal 漸層，顯示總答題數
# → 日曆：12 週格子，有答題日期亮 teal，hover 顯示日期
# → 明暗主題切換後版面正常
```
