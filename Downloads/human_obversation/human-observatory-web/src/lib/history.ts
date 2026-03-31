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
