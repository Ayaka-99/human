# 登入 / 跨裝置同步 設計文件

**日期：** 2026-03-31  
**狀態：** 已核准

---

## 1. 目標

- 用 Google OAuth 讓使用者可選擇性登入
- 未登入：答題歷史只存 localStorage，熱力圖不可見
- 登入後：歷史同步至 Supabase，熱力圖可見，跨裝置共享

---

## 2. 資料庫

新增 `user_answers` 表：

```sql
create table user_answers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  question_id  uuid not null,
  date         text not null,          -- 'YYYY-MM-DD'（台北時間）
  text_zh      text not null,
  user_answer  text not null,          -- 'A'|'B'|'C'|'D'|'E'
  answered_at  timestamptz not null default now(),
  unique(user_id, question_id)         -- 每題每人只存一筆
);

alter table user_answers enable row level security;
create policy "users see own" on user_answers
  for all using (auth.uid() = user_id);
```

---

## 3. Auth 設定

- 使用 Supabase 內建 Google OAuth provider
- 在 Supabase console → Authentication → Providers → Google 開啟
- Redirect URL：`{SITE_URL}/auth/callback`
- 新增 `src/app/auth/callback/route.ts`，處理 OAuth code exchange（使用 `@supabase/ssr` 的 `exchangeCodeForSession`）

---

## 4. 元件與檔案

### 新增

| 檔案 | 用途 |
|------|------|
| `src/hooks/useUser.ts` | 監聽 `onAuthStateChange`，回傳 `user \| null` |
| `src/components/ui/AuthButton.tsx` | Navbar 登入/登出按鈕 |
| `src/components/ui/LoginGate.tsx` | 包住熱力圖的登入遮罩 |
| `src/app/auth/callback/route.ts` | OAuth callback handler |

### 修改

| 檔案 | 變更 |
|------|------|
| `src/components/layout/Navbar.tsx` | 加入 `<AuthButton />` |
| `src/components/results/ResultsClient.tsx` | 熱力圖改用 `<LoginGate>` 包 |
| `src/app/api/submit-answer/route.ts` | 有 session 時 upsert `user_answers` |
| `src/app/history/page.tsx` | 登入後從 Supabase 讀，未登入從 localStorage 讀 |

### 不動

- `src/lib/history.ts`（localStorage 工具繼續給未登入用）
- `src/components/charts/WorldHeatmap.tsx`
- `src/components/charts/TimeHeatmap.tsx`

---

## 5. 資料流

### 送出答題

```
使用者送出
  └─ POST /api/submit-answer
       ├─ 寫 daily_stats（現有，不變）
       └─ 若 request 帶有有效 session
            └─ upsert user_answers（衝突 question_id+user_id 則忽略）
```

前端 `QuestionCard`：
- 未登入：繼續呼叫 `saveHistory()`（localStorage）
- 登入後：不呼叫 `saveHistory()`（歷史以 DB 為主）

### 歷史頁

```
/history 載入
  ├─ 取得 user（useUser hook）
  ├─ 未登入 → getHistory()（localStorage）
  └─ 登入   → supabase.from('user_answers').select().eq('user_id', uid).order('answered_at', desc)
```

### 熱力圖 gate

```
<LoginGate>
  ├─ 未登入 → 顯示半透明遮罩 + 「登入以查看」按鈕（觸發 Google OAuth）
  └─ 登入   → 直接 render children
```

---

## 6. `useUser` hook

```ts
// 監聽 Supabase auth 狀態，回傳 user | null
// 初始值從 getSession() 取得，避免 flash
```

---

## 7. `AuthButton` 元件

- 未登入：顯示「登入」文字按鈕
- 登入後：顯示 email 前綴（如 `ayaka@...` → `ayaka`）+ 點擊後呼叫 `signOut()`
- 樣式跟隨現有 Navbar 風格（`var(--text-muted)`）

---

## 8. `LoginGate` 元件

- Props：`children: ReactNode`
- 登入後：`return children`
- 未登入：render 一個相對定位的 wrapper
  - children 以 `filter: blur(6px) opacity(0.3)` 模糊顯示
  - 上方覆蓋卡片：「登入以查看熱力圖」+ Google 登入按鈕

---

## 9. submit-answer route 修改

取得 session 方式：用 `@supabase/ssr` 的 `createServerClient`（需傳入 cookies）。  
若 `session.user` 存在，執行：

```ts
supabase.from('user_answers').upsert({
  user_id: session.user.id,
  question_id,
  date,
  text_zh,
  user_answer,
  answered_at: new Date().toISOString(),
}, { onConflict: 'user_id,question_id', ignoreDuplicates: true })
```

---

## 10. 不在此次範圍

- Email Magic Link 登入
- 合併現有 localStorage 歷史到雲端
- 使用者個人頁面
- 管理後台

---

## 11. 驗證方式

```bash
# 未登入
# → 首頁可答題，歷史存 localStorage
# → 結果頁熱力圖顯示遮罩，點擊觸發 Google 登入

# 登入後
# → Navbar 顯示使用者名稱
# → 答題後 user_answers 有新增紀錄
# → /history 顯示 DB 資料
# → 換裝置登入 → /history 仍有紀錄
# → 登出 → Navbar 回到「登入」，熱力圖遮罩出現
```
