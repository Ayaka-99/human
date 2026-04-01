'use client'
// ResultsPageClient.tsx — client-side fetch + render

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ResultsClient } from '@/components/results/ResultsClient'
import type { DailyStats, Question } from '@/types'

function ResultsContent() {
  const params = useParams<{ questionId: string }>()
  const searchParams = useSearchParams()
  const questionId = params.questionId
  const answer = searchParams.get('answer') ?? ''

  const [question, setQuestion] = useState<Question | null>(null)
  const [stats, setStats] = useState<DailyStats | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    Promise.all([
      supabase.from('questions').select('*').eq('id', questionId).single(),
      supabase.from('daily_stats').select('*').eq('question_id', questionId).single(),
    ]).then(([{ data: questionData }, { data: statsData }]) => {
      setQuestion(questionData as Question | null)
      setStats(statsData as DailyStats | null)
    })
  }, [questionId])

  return (
    <ResultsClient
      questionId={questionId}
      userAnswer={answer}
      question={question}
      initialStats={stats}
    />
  )
}

export default function ResultsPageClient() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  )
}
