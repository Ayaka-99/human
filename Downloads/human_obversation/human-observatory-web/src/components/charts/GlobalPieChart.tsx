'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface GlobalPieChartProps {
  distribution: Record<string, number>  // { A: 42, B: 18, ... }
  total: number
  userAnswer: string                    // 'A' | 'B' | 'C' | 'D' | 'E'
  options: { key: string; label_zh: string }[]
}

const ANSWER_COLOR: Record<string, string> = {
  A: '#3B82F6',
  B: '#10B981',
  C: '#F59E0B',
  D: '#EF4444',
  E: '#8B5CF6',
}

interface TooltipPayloadItem {
  name: string
  value: number
}

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  total: number
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
        color: 'var(--text)',
      }}
    >
      <div style={{ fontWeight: 600 }}>{item.name}</div>
      <div style={{ color: 'var(--text-muted)' }}>
        {item.value.toLocaleString('zh-TW')} 人（{pct}%）
      </div>
    </div>
  )
}

export function GlobalPieChart({ distribution, total, userAnswer, options }: GlobalPieChartProps) {
  const data = options.map((opt) => ({
    name: `${opt.key}  ${opt.label_zh}`,
    key: opt.key,
    value: distribution[opt.key] ?? 0,
  }))

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive
            animationDuration={800}
          >
            {data.map((entry) => {
              const isUser = entry.key === userAnswer
              return (
                <Cell
                  key={entry.key}
                  fill={ANSWER_COLOR[entry.key] ?? '#6B8599'}
                  opacity={isUser ? 1 : 0.5}
                  stroke={isUser ? '#ffffff' : 'none'}
                  strokeWidth={isUser ? 2 : 0}
                  {...(isUser ? { outerRadius: 98 } : {})}
                />
              )
            })}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
