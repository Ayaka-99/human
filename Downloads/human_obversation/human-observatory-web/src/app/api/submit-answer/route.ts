// src/app/api/submit-answer/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json() as { question_id: string; value: string }
  const { question_id, value } = body

  if (!question_id || !value) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 1. 插入答案（region 留 UNKNOWN，Vercel 部署後自動偵測 IP 國家）
  const { error: insertError } = await supabase
    .from('answers')
    .insert({ question_id, value, region: 'UNKNOWN' })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 2. 重新統計各選項票數
  const { data: allAnswers, error: countError } = await supabase
    .from('answers')
    .select('value')
    .eq('question_id', question_id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  const distribution: Record<string, number> = {}
  for (const row of allAnswers ?? []) {
    distribution[row.value] = (distribution[row.value] ?? 0) + 1
  }
  const total_count = allAnswers?.length ?? 0

  // 3. upsert daily_stats
  const { data: stats, error: upsertError } = await supabase
    .from('daily_stats')
    .upsert(
      { question_id, total_count, distribution, updated_at: new Date().toISOString() },
      { onConflict: 'question_id' }
    )
    .select()
    .single()

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, stats })
}
