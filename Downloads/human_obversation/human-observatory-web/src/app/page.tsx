// src/app/page.tsx
// Server Component（預設，不加 'use client'）
import { TODAY_QUESTION } from '@/lib/mockData'
import { QuestionCard } from '@/components/question/QuestionCard'

export default function HomePage() {
  // Day 3 替換為 Supabase fetch
  const question = TODAY_QUESTION

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
