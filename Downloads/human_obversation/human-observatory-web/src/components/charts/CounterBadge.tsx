// src/components/charts/CounterBadge.tsx
'use client'
import { useEffect, useRef, useState } from 'react'

interface CounterBadgeProps {
  count: number        // 與用戶相同選項的人數
  answerKey: string    // 'A' | 'B' | 'C' | 'D' | 'E'
}

const ANSWER_COLOR: Record<string, string> = {
  A: 'var(--answer-a)',
  B: 'var(--answer-b)',
  C: 'var(--answer-c)',
  D: 'var(--answer-d)',
  E: 'var(--answer-e)',
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function CounterBadge({ count, answerKey }: CounterBadgeProps) {
  const [displayCount, setDisplayCount] = useState(0)
  const rafRef = useRef<number | null>(null)
  const color = ANSWER_COLOR[answerKey] ?? 'var(--teal)'

  useEffect(() => {
    if (count === 0) {
      setDisplayCount(0)
      return
    }

    const DURATION = 1200
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = easeOutCubic(progress)
      setDisplayCount(Math.round(eased * count))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [count])

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px 16px',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color,
          lineHeight: 1.2,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {displayCount.toLocaleString('zh-TW')}
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          marginTop: 6,
        }}
      >
        個人跟你選了一樣的答案 🌍
      </div>
    </div>
  )
}
