// src/app/results/[questionId]/page.tsx
// Server Component — Day 3 填入真實統計內容

interface ResultsPageProps {
  params: Promise<{ questionId: string }>
  searchParams: Promise<{ answer?: string }>
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { questionId } = await params
  const { answer } = await searchParams

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px 32px',
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 8,
          }}
        >
          你選擇了選項 {answer}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          題目 ID：{questionId}
        </p>
        <p
          style={{
            marginTop: 24,
            color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          Day 3 將在這裡顯示揭曉動畫與統計圖表。
        </p>
      </div>
    </main>
  )
}
