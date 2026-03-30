// src/hooks/useGlobalResults.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DailyStats } from '@/types'

export function useGlobalResults(questionId: string, initialStats: DailyStats | null) {
  const [stats, setStats] = useState<DailyStats | null>(initialStats)

  useEffect(() => {
    const supabase = createClient()

    // Realtime 訂閱 daily_stats UPDATE
    const channel = supabase
      .channel(`daily_stats:${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_stats',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          setStats(payload.new as DailyStats)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [questionId])

  return stats
}
