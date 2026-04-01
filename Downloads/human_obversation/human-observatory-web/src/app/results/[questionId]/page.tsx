// src/app/results/[questionId]/page.tsx
// Server Component — 靜態 export 需要 generateStaticParams

import ResultsPageClient from './ResultsPageClient'

// questionId 完全動態，client-side fetch 處理
export const dynamicParams = false
export function generateStaticParams() {
  return []
}

export default function ResultsPage() {
  return <ResultsPageClient />
}
