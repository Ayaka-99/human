# Day 6 設計文件：歷史紀錄頁

**日期：** 2026-03-31
**範圍：** 歷史紀錄（localStorage）+ Navbar 連結
**不做：** 分享按鈕、AdSense、特質標籤（之後再做）

---

## 1. 資料結構

localStorage key：`"ho_history"`
格式：`HistoryEntry[]`（陣列，最新在前）

```ts
type HistoryEntry = {
  question_id: string  // UUID，對應 Supabase questions.id
  date: string         // "YYYY-MM-DD"（台北時間）
  text_zh: string      // 題目文字，submit 時從 question props 取得
  userAnswer: string   // "A" | "B" | "C" | "D" | "E"
}
```

**寫入時機：** `QuestionCard` 送出答案，API 回傳 200 後，`router.push` 之前。
**讀取時機：** `/history` 頁面 mount 時。
**上限：** 不限筆數（題目每天一題，半年也才 180 筆，不成問題）。
**重複防護：** 寫入前先用 `question_id` 去重，同一題只存一筆。

---

## 2. 新增/修改檔案

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/lib/history.ts` | 新建 | 讀寫 localStorage 工具函式 |
| `src/components/question/QuestionCard.tsx` | 修改 | submit 成功後呼叫 `saveHistory()` |
| `src/app/history/page.tsx` | 新建 | 歷史列表頁（Client Component） |
| `src/components/layout/Navbar.tsx` | 修改 | 加「歷史」導航連結 |

---

## 3. `src/lib/history.ts` 規格

```ts
const STORAGE_KEY = 'ho_history'

// 讀取全部紀錄（最新在前）
export function getHistory(): HistoryEntry[]

// 新增一筆紀錄（同一 question_id 只存一筆，不覆蓋）
export function saveHistory(entry: HistoryEntry): void

// 清空全部（未來用，先實作）
export function clearHistory(): void
```

`saveHistory` 邏輯：
1. 讀出現有陣列
2. 若已有相同 `question_id` → 直接 return（不覆蓋）
3. 新紀錄插到陣列最前面
4. `JSON.stringify` 存回 localStorage
5. 整個函式包在 `try/catch`，localStorage 不可用時靜默失敗

---

## 4. `QuestionCard.tsx` 修改

在 `handleSubmit` 的 `router.push` 之前加：

```ts
import { saveHistory } from '@/lib/history'

// API 回傳 200 後
saveHistory({
  question_id: question.id,
  date: question.date,
  text_zh: question.text_zh,
  userAnswer: selected,
})
router.push(`/results/${question.id}?answer=${selected}`)
```

---

## 5. `/history` 頁面規格

**類型：** Client Component（需要讀 localStorage）
**路徑：** `src/app/history/page.tsx`

**狀態：**
- `mounted: boolean`——防 SSR hydration mismatch（localStorage 只在 client 存在）
- `entries: HistoryEntry[]`——mount 後讀取

**UI 結構：**
```
頁面標題：「答題紀錄」
副標題：「你在這台裝置上的答題歷史」（小字，text-muted）

若無紀錄：
  提示文字「還沒有紀錄，去答今天的題目吧」
  連結回首頁

若有紀錄（列表）：
  每筆 → HistoryCard
    - 左上：日期（text-muted，小字）
    - 主文：題目文字（最多兩行，超過 ellipsis）
    - 右側：選項標籤（色圓點 + 字母，對應 --answer-X 色）
    - 整張可點擊 → router.push(/results/[question_id]?answer=[userAnswer])
```

**空狀態和 mounted 前：** `mounted` 為 false 時渲染 loading skeleton（避免 SSR/client 不一致）。

---

## 6. Navbar 修改

在現有連結後加「歷史」，連到 `/history`。
樣式跟隨既有 Navbar 連結風格（`var(--text-muted)`，active 時 `var(--teal)`）。

---

## 7. 不在此次範圍

- 分享按鈕
- AdSense
- 特質標籤
- 登入 / 跨裝置同步

---

## 8. 驗證方式

```bash
cd c:/Users/ayaka/Downloads/human_obversation/human-observatory-web
npm run dev
# → 答一題送出 → 結果頁正常
# → 點 Navbar「歷史」→ 看到剛才那筆紀錄
# → 點紀錄 → 跳到結果頁，選項高亮正確
# → 重新整理歷史頁，紀錄仍在
# → 用同一題再送一次（若能）→ 紀錄只有一筆（去重正常）
```
