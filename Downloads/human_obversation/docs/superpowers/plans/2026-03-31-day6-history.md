# Day 6 歷史紀錄 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 實作 localStorage 答題歷史紀錄，包含讀寫工具函式、QuestionCard 寫入、/history 列表頁。

**Architecture:** 送出答案成功後，QuestionCard 呼叫 `saveHistory()` 把題目資訊寫入 localStorage。/history 頁面 mount 後讀取並渲染列表，點擊每筆紀錄跳到既有的結果頁。

**Tech Stack:** Next.js 16 App Router、TypeScript、localStorage、CSS Variables（既有設計系統）

---

## 檔案清單

| 動作 | 路徑 | 說明 |
|------|------|------|
| 新建 | `src/lib/history.ts` | localStorage 讀寫工具 |
| 修改 | `src/components/question/QuestionCard.tsx` | submit 成功後寫入 history |
| 新建 | `src/app/history/page.tsx` | 歷史列表頁 Client Component |

> Navbar 已有「歷史紀錄」連結指向 `/history`，不需修改。

---

### Task 1：建立 `src/lib/history.ts`

**Files:**
- Create: `human-observatory-web/src/lib/history.ts`

- [ ] **Step 1：建立檔案，寫入完整內容**

```typescript
// src/lib/history.ts
// localStorage 答題歷史讀寫工具

const STORAGE_KEY = 'ho_history'

export interface HistoryEntry {
  question_id: string  // UUID
  date: string         // "YYYY-MM-DD"（台北時間）
  text_zh: string      // 題目文字
  userAnswer: string   // "A" | "B" | "C" | "D" | "E"
}

/** 讀取全部紀錄（最新在前） */
export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

/** 新增一筆紀錄（同一 question_id 只存一筆，不覆蓋） */
export function saveHistory(entry: HistoryEntry): void {
  try {
    const existing = getHistory()
    if (existing.some(e => e.question_id === entry.question_id)) return
    const updated = [entry, ...existing]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage 不可用時靜默失敗
  }
}

/** 清空全部紀錄 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 靜默失敗
  }
}
```

- [ ] **Step 2：Commit**

```bash
git add human-observatory-web/src/lib/history.ts
git commit -m "feat: add history localStorage utility"
```

---

### Task 2：修改 `QuestionCard.tsx`，submit 成功後寫入歷史

**Files:**
- Modify: `human-observatory-web/src/components/question/QuestionCard.tsx`

目前 `handleSubmit` 在 `res.ok` 後直接 `router.push`，在那一行**之前**加入 `saveHistory`。

- [ ] **Step 1：在檔案頂端加入 import**

在現有 import 後加一行：

```typescript
import { saveHistory } from '@/lib/history'
```

- [ ] **Step 2：在 `router.push` 前加入 saveHistory 呼叫**

找到 `handleSubmit` 裡這段：

```typescript
    router.push(`/results/${question.id}?answer=${selected}`)
```

改為：

```typescript
    saveHistory({
      question_id: question.id,
      date: question.date,
      text_zh: question.text_zh,
      userAnswer: selected,
    })
    router.push(`/results/${question.id}?answer=${selected}`)
```

- [ ] **Step 3：手動驗證**

```bash
cd human-observatory-web && npm run dev
# → 開 localhost:3000
# → 選一個答案送出
# → 開 DevTools → Application → Local Storage → localhost:3000
# → 確認 ho_history 有一筆資料，格式正確
```

- [ ] **Step 4：Commit**

```bash
git add human-observatory-web/src/components/question/QuestionCard.tsx
git commit -m "feat: save answer to localStorage history on submit"
```

---

### Task 3：建立 `/history` 頁面

**Files:**
- Create: `human-observatory-web/src/app/history/page.tsx`

- [ ] **Step 1：建立檔案，寫入完整內容**

```typescript
// src/app/history/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, type HistoryEntry } from '@/lib/history'

const ANSWER_COLOR: Record<string, string> = {
  A: 'var(--answer-a)',
  B: 'var(--answer-b)',
  C: 'var(--answer-c)',
  D: 'var(--answer-d)',
  E: 'var(--answer-e)',
}

export default function HistoryPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(getHistory())
    setMounted(true)
  }, [])

  // SSR 階段不渲染內容，避免 hydration mismatch
  if (!mounted) {
    return (
      <main style={{ flex: 1, padding: '40px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <div style={{ height: 32, background: 'var(--surface-high)', borderRadius: 8, marginBottom: 24, width: 120 }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 80,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            marginBottom: 12,
          }} />
        ))}
      </main>
    )
  }

  return (
    <main style={{ flex: 1, padding: '40px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      {/* 頁面標題 */}
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
        答題紀錄
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
        你在這台裝置上的答題歷史
      </p>

      {/* 空狀態 */}
      {entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20 }}>
            還沒有紀錄，去答今天的題目吧
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--teal)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            去答題
          </button>
        </div>
      )}

      {/* 歷史列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.map(entry => {
          const color = ANSWER_COLOR[entry.userAnswer] ?? 'var(--teal)'
          return (
            <button
              key={entry.question_id}
              onClick={() => router.push(`/results/${entry.question_id}?answer=${entry.userAnswer}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {/* 左側：日期 + 題目 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>
                  {entry.date}
                </div>
                <div style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {entry.text_zh}
                </div>
              </div>

              {/* 右側：選項標籤 */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `2px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color,
                flexShrink: 0,
              }}>
                {entry.userAnswer}
              </div>
            </button>
          )
        })}
      </div>
    </main>
  )
}
```

- [ ] **Step 2：手動驗證**

```bash
# dev server 應已在跑
# → 開 localhost:3000/history
# → 若剛才 Task 2 已送出答案，應看到一筆紀錄
# → 點那筆紀錄 → 跳到 /results/[questionId]?answer=X
# → 重新整理 /history → 紀錄仍在
# → 切換明暗主題 → 卡片顏色正確跟隨主題
```

**空狀態驗證：**
```
# → 開 DevTools → Application → Local Storage
# → 刪除 ho_history
# → 重新整理 /history → 顯示「還沒有紀錄」+ 去答題按鈕
# → 點「去答題」→ 回到首頁
```

- [ ] **Step 3：Commit**

```bash
git add human-observatory-web/src/app/history/page.tsx
git commit -m "feat: add history page with localStorage entries"
```

---

### Task 4：寫 dev-diary Day 6 紀錄

**Files:**
- Modify: `docs/dev-diary.md`

- [ ] **Step 1：在 dev-diary.md 末尾加入 Day 6 紀錄**

在檔案最後加入：

```markdown
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
```

- [ ] **Step 2：Commit**

```bash
git add docs/dev-diary.md
git commit -m "docs: add Day 6 dev-diary entry for history feature"
```
