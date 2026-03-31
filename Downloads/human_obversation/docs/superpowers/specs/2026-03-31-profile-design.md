# 個人頁設計文件

**日期：** 2026-03-31  
**狀態：** 已核准

---

## 1. 目標

在 `/profile` 建立個人統計頁，顯示：
- 總答題數（英雄橫幅）
- 最近 12 週答題日曆熱圖

資料全來自 `localStorage`，純 client-side，不需後端或登入。

---

## 2. 頁面結構

```
/profile
  └─ 英雄橫幅：總答題數（大數字 + teal 漸層背景）
  └─ 答題日曆卡片
       ├─ 標題「答題紀錄」+ 副標「最近 12 週」
       ├─ 7 行 × 12 欄格子（週一～週日，最舊在左，最新在右）
       │    ├─ 有答題 → teal (#0d9488)
       │    └─ 沒答題 → var(--surface-high)
       └─ 圖例（右下角：灰=沒答題 / teal=有答題）
```

---

## 3. 元件與檔案

### 新增

| 檔案 | 用途 |
|------|------|
| `src/app/profile/page.tsx` | 個人頁主頁面（client component） |
| `src/components/charts/ActivityCalendar.tsx` | 12 週答題日曆熱圖元件 |

### 不動

- `src/lib/history.ts`（直接呼叫 `getHistory()`）
- `src/components/layout/Navbar.tsx`（已有 `/profile` 連結）

---

## 4. 資料計算邏輯

### 總答題數
```ts
const total = getHistory().length
```

### 日曆熱圖（最近 12 週）

1. 計算「今天」的台北時間日期字串 `YYYY-MM-DD`
2. 往回推 84 天（12 週 × 7 天），產生日期陣列
3. 將 `getHistory()` 的 `date` 欄位轉為 Set
4. 每格：日期在 Set 內 → `filled = true`

```ts
// 產生最近 84 天的日期陣列（最舊 → 最新）
function getLast12Weeks(): { date: string; filled: boolean }[] {
  const answeredDates = new Set(getHistory().map(e => e.date))
  const result = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' }) // YYYY-MM-DD
    result.push({ date, filled: answeredDates.has(date) })
  }
  return result
}
```

### 格子排列

- CSS Grid：`grid-template-rows: repeat(7, 12px)`、`grid-template-columns: repeat(12, 1fr)`
- `grid-auto-flow: column`（先填滿一週再換下一欄）
- 84 格 = 12 週 × 7 天

---

## 5. 視覺規格

### 英雄橫幅
```css
background: linear-gradient(135deg, #0d9488, #0891b2);
border-radius: 12px;
padding: 28px;
text-align: center;
```
- 數字：`font-size: 48px; font-weight: 700; color: #fff`
- 副標：`font-size: 13px; color: rgba(255,255,255,0.75)`

### 日曆卡片
- 樣式與 `/history` 的卡片一致：`background: var(--surface); border: 1px solid var(--border); border-radius: 12px`
- 格子大小：`12px × 12px`，`gap: 3px`，`border-radius: 2px`
- 有答題：`background: #0d9488`（teal）
- 沒答題：`background: var(--surface-high)`

---

## 6. SSR 處理

`localStorage` 只在瀏覽器可用，與 `history/page.tsx` 相同做法：
- `useState(false)` + `useEffect` 中讀取資料並 `setMounted(true)`
- SSR 階段回傳骨架（skeleton），避免 hydration mismatch

---

## 7. 不在此次範圍

- 連續天數（streak）計算
- 選項偏好分佈圖
- 登入 / 跨裝置同步
- 清除歷史按鈕
