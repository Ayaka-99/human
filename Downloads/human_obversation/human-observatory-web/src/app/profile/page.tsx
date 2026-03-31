'use client'

import { useEffect, useState } from 'react'
import { getHistory } from '@/lib/history'
import { ActivityCalendar } from '@/components/charts/ActivityCalendar'

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [total, setTotal] = useState(0)
  const [answeredDates, setAnsweredDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const history = getHistory()
    setTotal(history.length)
    setAnsweredDates(new Set(history.map((e) => e.date)))
    setMounted(true)
  }, [])

  // SSR 階段回傳骨架，避免 hydration mismatch
  if (!mounted) {
    return (
      <main
        style={{ flex: 1, padding: '40px 16px', maxWidth: 560, margin: '0 auto', width: '100%' }}
      >
        <div
          style={{ height: 120, background: 'var(--surface-high)', borderRadius: 12, marginBottom: 24 }}
        />
        <div style={{ height: 140, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
      </main>
    )
  }

  return (
    <main
      style={{ flex: 1, padding: '40px 16px', maxWidth: 560, margin: '0 auto', width: '100%' }}
    >
      {/* 英雄橫幅：總答題數 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d9488, #0891b2)',
          borderRadius: 12,
          padding: 28,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
          {total}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
          題已完成
        </div>
      </div>

      {/* 答題日曆 */}
      <ActivityCalendar answeredDates={answeredDates} />
    </main>
  )
}
