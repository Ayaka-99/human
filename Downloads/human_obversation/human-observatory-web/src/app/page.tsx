// src/app/page.tsx
// Server Component — 從 Supabase 取今日題目
import { createServerClient } from '@/lib/supabase/server'
import { QuestionCard } from '@/components/question/QuestionCard'
import { TODAY_QUESTION } from '@/lib/mockData'
import type { Question } from '@/types'

// 取得台北今日日期 YYYY-MM-DD
function getTodayTaipei(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
}

export default async function HomePage() {
  const supabase = createServerClient()
  const today = getTodayTaipei()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('date', today)
    .single()

  // 若 Supabase 沒有今日題目，fallback 到假資料
  const question: Question = (!error && data)
    ? {
        id: data.id,
        date: data.date,
        text_zh: data.text_zh,
        type: data.type,
        options: data.options,
      }
    : TODAY_QUESTION

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <QuestionCard question={question} />
    </main>
  )
}
