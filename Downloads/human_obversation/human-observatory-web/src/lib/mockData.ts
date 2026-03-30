// src/lib/mockData.ts
import type { Question } from '@/types'

// 靜態假資料，等 Supabase 接上後替換
export const TODAY_QUESTION: Question = {
  id: 'mock-2026-03-30',
  date: '2026-03-30',
  text_zh: '如果你可以選擇，你希望能力強的人如何分配他們的才能？',
  type: 'single',
  options: [
    { key: 'A', label_zh: '追求個人成就，成為頂尖專家' },
    { key: 'B', label_zh: '貢獻社會，解決大眾問題' },
    { key: 'C', label_zh: '平衡個人與社會，兩者都做' },
    { key: 'D', label_zh: '由他們自己決定，不應強加期望' },
    { key: 'E', label_zh: '取決於才能的性質，沒有統一答案' },
  ],
}

// 假用戶今天是否已回答（false = 尚未回答）
export const HAS_ANSWERED_TODAY = false
