'use client'
// src/app/page.tsx
// Client Component — 從 Supabase 取今日題目

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { QuestionCard } from '@/components/question/QuestionCard'
import { TODAY_QUESTION } from '@/lib/mockData'
import type { Question } from '@/types'

function getTodayTaipei(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
}

export default function HomePage() {
  const [question, setQuestion] = useState<Question>(TODAY_QUESTION)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const today = getTodayTaipei()
    supabase
      .from('questions')
      .select('*')
      .eq('date', today)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setQuestion({
            id: data.id,
            date: data.date,
            text_zh: data.text_zh,
            type: data.type,
            options: data.options,
          })
        }
      })
  }, [])

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
