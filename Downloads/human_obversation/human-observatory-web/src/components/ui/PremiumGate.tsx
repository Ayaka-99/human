// src/components/ui/PremiumGate.tsx
'use client'

interface PremiumGateProps {
  children: React.ReactNode
  locked?: boolean       // 預設 true（MVP 全鎖）
  feature?: string       // 顯示在鎖定提示中的功能名稱，例如「世界地圖分佈」
}

export function PremiumGate({ children, locked = true, feature }: PremiumGateProps) {
  if (!locked) return <>{children}</>

  return (
    <div style={{ position: 'relative' }}>
      {/* 模糊的內容層 */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* 鎖定覆蓋層 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'rgba(8, 12, 16, 0.7)',
          borderRadius: 'var(--radius)',
        }}
      >
        <div style={{ fontSize: 28 }}>🔒</div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          {feature ? `${feature}` : '進階功能'}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            textAlign: 'center',
            maxWidth: 200,
          }}
        >
          升級後解鎖完整資料洞察
        </div>
      </div>
    </div>
  )
}
