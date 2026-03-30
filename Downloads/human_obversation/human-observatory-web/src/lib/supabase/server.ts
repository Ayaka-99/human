// src/lib/supabase/server.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server Components 和 Route Handlers 用
// 使用 anon key（RLS 保護），不暴露 service role key
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
