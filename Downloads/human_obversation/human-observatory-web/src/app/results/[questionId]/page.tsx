// src/app/results/[questionId]/page.tsx
// Server Component — 讀 Supabase 統計並顯示分佈
import { createServerClient } from '@/lib/supabase/server'
import type { DailyStats, Question } from '@/types'

interface ResultsPageProps {
  params: Promise<{ questionId: string }>
  searchParams: Promise<{ answer?: string }>
}

const ANSWER_COLOR: Record<string, string> = {
  A: 'var(--answer-a)',
  B: 'var(--answer-b)',
  C: 'var(--answer-c)',
  D: 'var(--answer-d)',
  E: 'var(--answer-e)',
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { questionId } = await params
  const { answer } = await searchParams

  const supabase = createServerClient()

  // 讀取題目
  const { data: questionData } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single()

  // 讀取統計
  const { data: statsData } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('question_id', questionId)
    .single()

  const question = questionData as Question | null
  const stats = statsData as DailyStats | null
  const distribution = stats?.distribution ?? {}
  const total = stats?.total_count ?? 0

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
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px 32px',
          maxWidth: 560,
          width: '100%',
        }}
      >
        {/* 標題 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 6,
            }}
          >
            你選擇了選項 {answer}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            共 {total.toLocaleString('zh-TW')} 人回答了這題
          </p>
        </div>

        {/* 題目文字（若有） */}
        {question && (
          <p
            style={{
              fontSize: 15,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: 28,
              paddingBottom: 28,
              borderBottom: '1px solid var(--border)',
            }}
          >
            {question.text_zh}
          </p>
        )}

        {/* 各選項分佈長條圖 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(question?.options ?? [{ key: 'A' }, { key: 'B' }, { key: 'C' }, { key: 'D' }, { key: 'E' }]).map((opt) => {
            const count = distribution[opt.key] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const color = ANSWER_COLOR[opt.key] ?? 'var(--teal)'
            const isUserAnswer = opt.key === answer

            return (
              <div key={opt.key}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      color: isUserAnswer ? color : 'var(--text-muted)',
                      fontWeight: isUserAnswer ? 600 : 400,
                    }}
                  >
                    {opt.key}{'label_zh' in opt ? `  ${(opt as { key: string; label_zh: string }).label_zh}` : ''}
                    {isUserAnswer && ' ✓'}
                  </span>
                  <span
                    style={{
                      color: isUserAnswer ? color : 'var(--text-muted)',
                      fontWeight: isUserAnswer ? 600 : 400,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                {/* 長條 */}
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--surface-high)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 3,
                      background: isUserAnswer ? color : `${color}60`,
                      transition: 'width 0.8s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
