// src/components/question/QuestionCard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
}

// 答案對應的 CSS variable 顏色
const ANSWER_COLOR: Record<string, string> = {
  A: 'var(--answer-a)',
  B: 'var(--answer-b)',
  C: 'var(--answer-c)',
  D: 'var(--answer-d)',
  E: 'var(--answer-e)',
}

export function QuestionCard({ question }: QuestionCardProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 提交選擇，導向結果頁
  async function handleSubmit() {
    if (!selected || submitting) return
    setSubmitting(true)
    // Day 3 會替換為真實 API 呼叫
    router.push(`/results/${question.id}?answer=${selected}`)
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '32px 28px',
        maxWidth: 560,
        width: '100%',
      }}
    >
      {/* 日期標籤 */}
      <div
        style={{
          fontSize: 12,
          color: 'var(--teal)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        {question.date} · 每日一題
      </div>

      {/* 題目文字 */}
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.6,
          color: 'var(--text)',
          marginBottom: 28,
        }}
      >
        {question.text_zh}
      </h1>

      {/* 選項列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((opt) => {
          const isSelected = selected === opt.key
          const color = ANSWER_COLOR[opt.key] ?? 'var(--teal)'
          return (
            <button
              key={opt.key}
              onClick={() => setSelected(opt.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: `1px solid ${isSelected ? `${color}80` : 'var(--border)'}`,
                background: isSelected ? `${color}12` : 'var(--surface-high)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {/* 選項字母標籤 */}
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: `1.5px solid ${isSelected ? color : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: isSelected ? color : 'var(--text-muted)',
                  flexShrink: 0,
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                {opt.key}
              </span>
              {/* 選項文字 */}
              <span
                style={{
                  fontSize: 15,
                  color: isSelected ? 'var(--text)' : 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                {opt.label_zh}
              </span>
            </button>
          )
        })}
      </div>

      {/* 提交按鈕 */}
      <button
        onClick={handleSubmit}
        disabled={!selected || submitting}
        style={{
          marginTop: 24,
          width: '100%',
          padding: '14px',
          borderRadius: 8,
          border: 'none',
          background: selected ? 'var(--teal)' : 'var(--surface-high)',
          color: selected ? '#fff' : 'var(--text-muted)',
          fontSize: 15,
          fontWeight: 600,
          cursor: selected ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {submitting ? '送出中…' : '送出答案'}
      </button>
    </div>
  )
}
