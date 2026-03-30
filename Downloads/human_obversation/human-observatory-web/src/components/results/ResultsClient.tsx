// src/components/results/ResultsClient.tsx
'use client'
import { useEffect, useState } from 'react'
import { RevealAnimation } from '@/components/question/RevealAnimation'
import { CounterBadge } from '@/components/charts/CounterBadge'
import { GlobalPieChart } from '@/components/charts/GlobalPieChart'
import { WorldHeatmap } from '@/components/charts/WorldHeatmap'
import { TimeHeatmap } from '@/components/charts/TimeHeatmap'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { useGlobalResults } from '@/hooks/useGlobalResults'
import type { DailyStats, Question } from '@/types'

interface ResultsClientProps {
  questionId: string
  userAnswer: string
  question: Question | null
  initialStats: DailyStats | null
}

const ANSWER_COLOR: Record<string, string> = {
  A: 'var(--answer-a)',
  B: 'var(--answer-b)',
  C: 'var(--answer-c)',
  D: 'var(--answer-d)',
  E: 'var(--answer-e)',
}

const FALLBACK_OPTIONS = ['A', 'B', 'C', 'D', 'E'].map((k) => ({ key: k, label_zh: '' }))

export function ResultsClient({
  questionId,
  userAnswer,
  question,
  initialStats,
}: ResultsClientProps) {
  const stats = useGlobalResults(questionId, initialStats)
  const [revealed, setRevealed] = useState(false)

  const distribution = stats?.distribution ?? {}
  const total = stats?.total_count ?? 0
  const sameCount = distribution[userAnswer] ?? 0
  const options = question?.options ?? FALLBACK_OPTIONS

  // 頁面 mount 後觸發揭曉動畫
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100)
    return () => clearTimeout(timer)
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
      <RevealAnimation trigger={revealed}>
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
          {/* 地球圖示 */}
          <div className="reveal-item" style={{ textAlign: 'center', marginBottom: 4, opacity: 0 }}>
            <div style={{ fontSize: 48 }}>🌍</div>
          </div>

          {/* CounterBadge */}
          <div className="reveal-item" style={{ opacity: 0 }}>
            <CounterBadge count={sameCount} answerKey={userAnswer} />
          </div>

          {/* 你選了 + 總人數 */}
          <div className="reveal-item" style={{ textAlign: 'center', marginBottom: 24, opacity: 0 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              共{' '}
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                {total.toLocaleString('zh-TW')}
              </span>{' '}
              人回答了這題，你選了{' '}
              <span
                style={{
                  color: ANSWER_COLOR[userAnswer] ?? 'var(--teal)',
                  fontWeight: 600,
                }}
              >
                {userAnswer}
              </span>
            </p>
          </div>

          {/* 題目文字（若有） */}
          {question && (
            <div
              className="reveal-item"
              style={{
                opacity: 0,
                fontSize: 15,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: 28,
                paddingBottom: 28,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {question.text_zh}
            </div>
          )}

          {/* GlobalPieChart */}
          <div className="reveal-item" style={{ opacity: 0 }}>
            <GlobalPieChart
              distribution={distribution}
              total={total}
              userAnswer={userAnswer}
              options={options}
            />
          </div>

          {/* 各選項長條 */}
          <div className="reveal-item" style={{ display: 'flex', flexDirection: 'column', gap: 14, opacity: 0 }}>
            {options.map((opt) => {
              const count = distribution[opt.key] ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const color = ANSWER_COLOR[opt.key] ?? 'var(--teal)'
              const isUserAnswer = opt.key === userAnswer

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
                      {opt.key}
                      {opt.label_zh ? `  ${opt.label_zh}` : ''}
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
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* WorldHeatmap — Premium Gate */}
          <div className="reveal-item" style={{ opacity: 0, marginTop: 32 }}>
            <PremiumGate feature="世界地圖分佈">
              <WorldHeatmap
                regionBreakdown={stats?.region_breakdown ?? {}}
                userAnswer={userAnswer}
                options={options}
              />
            </PremiumGate>
          </div>

          {/* TimeHeatmap — Premium Gate */}
          <div className="reveal-item" style={{ opacity: 0, marginTop: 24 }}>
            <PremiumGate feature="時段熱力圖">
              <TimeHeatmap
                timeBreakdown={stats?.time_breakdown ?? {}}
                options={options}
              />
            </PremiumGate>
          </div>
        </div>
      </RevealAnimation>
    </main>
  )
}
