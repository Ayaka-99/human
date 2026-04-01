// src/app/results/[questionId]/page.tsx
// Server Component — 靜態 export 需要 generateStaticParams

import ResultsPageClient from './ResultsPageClient'

// questionId 完全動態，回傳空陣列讓 Next.js 知道有此路由存在
export function generateStaticParams() {
  return []
}

export default function ResultsPage() {
  return <ResultsPageClient />
}
