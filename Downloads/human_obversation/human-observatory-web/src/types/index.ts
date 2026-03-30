// src/types/index.ts
// 題目選項
export interface QuestionOption {
  key: string        // 'A' | 'B' | 'C' | 'D' | 'E'
  label_zh: string   // 中文選項文字
}

// 題目
export interface Question {
  id: string
  date: string          // 'YYYY-MM-DD'
  text_zh: string       // 題目中文文字
  type: 'single'        // 目前只做單選
  options: QuestionOption[]
}

// 每日統計（對應 Supabase daily_stats 表）
export interface DailyStats {
  question_id: string
  total_count: number
  distribution: Record<string, number>  // { A: 42, B: 18, ... }
  region_breakdown?: Record<string, Record<string, number>>  // { TW: { A: 72, B: 18 }, JP: { A: 58 } }
  time_breakdown?: Record<string, Record<string, number>>    // { "08": { A: 12, B: 5 }, "09": { A: 8 } }
  updated_at: string
}
