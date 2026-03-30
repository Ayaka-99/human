// src/components/charts/TimeHeatmap.tsx
'use client'

import React from 'react'

interface TimeHeatmapProps {
  timeBreakdown: Record<string, Record<string, number>>  // { "08": { A: 12, B: 5 }, ... }
  options: { key: string; label_zh: string }[]
}

const ANSWER_HEX: Record<string, string> = {
  A: '#3B82F6',
  B: '#10B981',
  C: '#F59E0B',
  D: '#EF4444',
  E: '#8B5CF6',
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

function hexWithOpacity(hex: string, opacity: number): string {
  // opacity 0~1 → 兩位十六進位
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return `${hex}${alpha}`
}

export function TimeHeatmap({ timeBreakdown, options }: TimeHeatmapProps) {
  // 找全域最大值，用來做相對色階
  let maxVal = 1
  Object.values(timeBreakdown).forEach((dist) => {
    Object.values(dist).forEach((v) => {
      if (v > maxVal) maxVal = v
    })
  })

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
        各時段回答分佈（UTC+8）
      </div>

      {/* 格子圖：列 = 選項，欄 = 24 小時 */}
      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `32px repeat(24, 1fr)`,
            gap: 2,
            minWidth: 520,
          }}
        >
          {/* 時間軸標頭 */}
          <div />
          {HOURS.map((h) => (
            <div
              key={h}
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: '16px',
              }}
            >
              {parseInt(h) % 4 === 0 ? h : ''}
            </div>
          ))}

          {/* 每個選項一列 */}
          {options.map((opt) => (
            <React.Fragment key={opt.key}>
              <div
                key={`label-${opt.key}`}
                style={{
                  fontSize: 11,
                  color: ANSWER_HEX[opt.key] ?? 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                }}
              >
                {opt.key}
              </div>
              {HOURS.map((h) => {
                const val = timeBreakdown[h]?.[opt.key] ?? 0
                const opacity = val === 0 ? 0.06 : 0.15 + (val / maxVal) * 0.85
                const hex = ANSWER_HEX[opt.key] ?? '#6B8599'
                return (
                  <div
                    key={`${opt.key}-${h}`}
                    title={val > 0 ? `${h}:00  選項${opt.key}  ${val}人` : undefined}
                    style={{
                      height: 18,
                      borderRadius: 2,
                      background: hexWithOpacity(hex, opacity),
                    }}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 說明 */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
        顏色越深代表該時段選擇人數越多
      </div>
    </div>
  )
}
