// src/app/history/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, type HistoryEntry } from '@/lib/history'

const ANSWER_COLOR: Record<string, string> = {
  A: 'var(--answer-a)',
  B: 'var(--answer-b)',
  C: 'var(--answer-c)',
  D: 'var(--answer-d)',
  E: 'var(--answer-e)',
}

export default function HistoryPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(getHistory())
    setMounted(true)
  }, [])

  // SSR 階段不渲染內容，避免 hydration mismatch
  if (!mounted) {
    return (
      <main style={{ flex: 1, padding: '40px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <div style={{ height: 32, background: 'var(--surface-high)', borderRadius: 8, marginBottom: 24, width: 120 }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 80,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            marginBottom: 12,
          }} />
        ))}
      </main>
    )
  }

  return (
    <main style={{ flex: 1, padding: '40px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      {/* 頁面標題 */}
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
        答題紀錄
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
        你在這台裝置上的答題歷史
      </p>

      {/* 空狀態 */}
      {entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20 }}>
            還沒有紀錄，去答今天的題目吧
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--teal)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            去答題
          </button>
        </div>
      )}

      {/* 歷史列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.map(entry => {
          const color = ANSWER_COLOR[entry.userAnswer] ?? 'var(--teal)'
          return (
            <button
              key={entry.question_id}
              onClick={() => router.push(`/results/${entry.question_id}?answer=${entry.userAnswer}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--teal)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {/* 左側：日期 + 題目 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em' }}>
                  {entry.date}
                </div>
                <div style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {entry.text_zh}
                </div>
              </div>

              {/* 右側：選項標籤 */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `2px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color,
                flexShrink: 0,
              }}>
                {entry.userAnswer}
              </div>
            </button>
          )
        })}
      </div>
    </main>
  )
}
