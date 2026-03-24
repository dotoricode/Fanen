/** 투자 일지 feature 타입 정의 */
import type { Database } from '@/types/database.types';

export type TradeJournalRow = Database['public']['Tables']['trade_journals']['Row'];
export type TradeJournalInsert = Database['public']['Tables']['trade_journals']['Insert'];
export type TradeJournalUpdate = Database['public']['Tables']['trade_journals']['Update'];

/** 감정 유형 */
export type EmotionType = 'excited' | 'neutral' | 'anxious' | 'regret';

/** 감정 표시 설정 */
export const EMOTION_CONFIG: Record<EmotionType, { emoji: string; label: string; color: string }> = {
  excited: { emoji: '😊', label: '흥분', color: 'text-yellow-600' },
  neutral: { emoji: '😐', label: '보통', color: 'text-gray-600' },
  anxious: { emoji: '😰', label: '불안', color: 'text-blue-600' },
  regret: { emoji: '😢', label: '후회', color: 'text-red-600' },
};

/** emotion 값으로 설정 조회. null 또는 알 수 없는 값은 neutral 반환 */
export function getEmotionConfig(emotion: string | null) {
  if (!emotion) return EMOTION_CONFIG.neutral;
  return EMOTION_CONFIG[emotion as EmotionType] ?? EMOTION_CONFIG.neutral;
}
