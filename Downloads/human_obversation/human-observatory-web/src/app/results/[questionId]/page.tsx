// src/app/results/[questionId]/page.tsx
// Server Component — SSR fetch，渲染 ResultsClient
import { createServerClient } from '@/lib/supabase/server'
import { ResultsClient } from '@/components/results/ResultsClient'
import type { DailyStats, Question } from '@/types'

interface ResultsPageProps {
  params: Promise<{ questionId: string }>
  searchParams: Promise<{ answer?: string }>
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { questionId } = await params
  const { answer } = await searchParams

  const supabase = createServerClient()

  const [{ data: questionData }, { data: statsData }] = await Promise.all([
    supabase.from('questions').select('*').eq('id', questionId).single(),
    supabase.from('daily_stats').select('*').eq('question_id', questionId).single(),
  ])

  return (
    <ResultsClient
      questionId={questionId}
      userAnswer={answer ?? ''}
      question={questionData as Question | null}
      initialStats={statsData as DailyStats | null}
    />
  )
}
