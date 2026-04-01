import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  return (
    <nav
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* 左側：品牌名稱 */}
      <Link
        href="/"
        style={{
          color: 'var(--teal)',
          fontWeight: 700,
          fontSize: 18,
          textDecoration: 'none',
          letterSpacing: '0.02em',
        }}
      >
        人類觀測站
      </Link>

      {/* 右側：導航連結 + 主題切換 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          href="/history"
          style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}
        >
          歷史紀錄
        </Link>
        <Link
          href="/profile"
          style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}
        >
          個人頁
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  )
}
