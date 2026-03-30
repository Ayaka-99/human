// src/app/api/submit-answer/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json() as { question_id: string; value: string }
  const { question_id, value } = body

  if (!question_id || !value) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const VALID_VALUES = ['A', 'B', 'C', 'D', 'E']
  if (!VALID_VALUES.includes(value)) {
    return NextResponse.json({ error: 'invalid value' }, { status: 400 })
  }

  // 讀取 Vercel 地區 header（本地開發時為 null）
  const countryCode = request.headers.get('x-vercel-ip-country') ?? 'UNKNOWN'

  const supabase = createServerClient()

  const { error: questionError } = await supabase
    .from('questions')
    .select('id')
    .eq('id', question_id)
    .single()

  if (questionError) {
    return NextResponse.json({ error: 'invalid question_id' }, { status: 400 })
  }

  // 插入答案，包含 region
  const { error: insertError } = await supabase
    .from('answers')
    .insert({ question_id, value, region: countryCode })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 重新統計：distribution + region_breakdown + time_breakdown
  const { data: allAnswers, error: countError } = await supabase
    .from('answers')
    .select('value, region, created_at')
    .eq('question_id', question_id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  const distribution: Record<string, number> = {}
  const regionBreakdown: Record<string, Record<string, number>> = {}
  const timeBreakdown: Record<string, Record<string, number>> = {}

  for (const row of allAnswers ?? []) {
    // distribution
    distribution[row.value] = (distribution[row.value] ?? 0) + 1

    // region_breakdown（跳過 UNKNOWN）
    if (row.region && row.region !== 'UNKNOWN') {
      regionBreakdown[row.region] ??= {}
      regionBreakdown[row.region][row.value] = (regionBreakdown[row.region][row.value] ?? 0) + 1
    }

    // time_breakdown（UTC+8 小時）
    if (row.created_at) {
      const utc8Hour = new Date(
        new Date(row.created_at).getTime() + 8 * 60 * 60 * 1000
      ).getUTCHours()
      const hourKey = String(utc8Hour).padStart(2, '0')
      timeBreakdown[hourKey] ??= {}
      timeBreakdown[hourKey][row.value] = (timeBreakdown[hourKey][row.value] ?? 0) + 1
    }
  }

  const total_count = allAnswers?.length ?? 0

  const { data: stats, error: upsertError } = await supabase
    .from('daily_stats')
    .upsert(
      {
        question_id,
        total_count,
        distribution,
        region_breakdown: regionBreakdown,
        time_breakdown: timeBreakdown,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'question_id' }
    )
    .select()
    .single()

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, stats })
}
