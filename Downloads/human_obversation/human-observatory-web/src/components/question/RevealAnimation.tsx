// src/components/question/RevealAnimation.tsx
'use client'
import { useEffect } from 'react'
import { useAnimate, stagger } from 'framer-motion'

interface RevealAnimationProps {
  children: React.ReactNode
  trigger: boolean   // true = 開始播動畫
}

export function RevealAnimation({ children, trigger }: RevealAnimationProps) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (!trigger) return

    let isMounted = true

    async function runSequence() {
      await animate('.flash-overlay', { opacity: [0, 0.6, 0] }, { duration: 0.4 })
      if (!isMounted) return
      await animate(
        '.reveal-item',
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.5, delay: stagger(0.12) }
      )
    }

    runSequence()

    return () => {
      isMounted = false
    }
  }, [trigger, animate])

  return (
    <div ref={scope} style={{ position: 'relative' }}>
      {/* flash overlay */}
      <div
        className="flash-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--teal)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
      {children}
    </div>
  )
}
