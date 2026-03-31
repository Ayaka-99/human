'use client'

interface Props {
  answeredDates: Set<string>
}

/**
 * 產生最近 84 天的格子資料（最舊 → 最新）
 * 使用 sv-SE locale 取得 YYYY-MM-DD（台北時間）
 */
function buildCells(answeredDates: Set<string>): { date: string; filled: boolean }[] {
  const cells: { date: string; filled: boolean }[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
    cells.push({ date, filled: answeredDates.has(date) })
  }
  return cells
}

export function ActivityCalendar({ answeredDates }: Props) {
  const cells = buildCells(answeredDates)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        答題紀錄
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
        最近 12 週
      </div>

      {/* 7 行 × 12 欄，grid-auto-flow: column 讓格子先填滿一週再換欄 */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'repeat(7, 12px)',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 3,
          gridAutoFlow: 'column',
        }}
      >
        {cells.map(({ date, filled }) => (
          <div
            key={date}
            title={date}
            style={{
              borderRadius: 2,
              background: filled ? '#0d9488' : 'var(--surface-high)',
            }}
          />
        ))}
      </div>

      {/* 圖例 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>沒答題</span>
        <div
          style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface-high)' }}
        />
        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0d9488' }} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>有答題</span>
      </div>
    </div>
  )
}
