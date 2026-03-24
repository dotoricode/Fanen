/** 포트폴리오 feature 타입 정의 */
import type { Database } from '@/types/database.types';

export type PortfolioRow = Database['public']['Tables']['portfolios']['Row'];
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert'];
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update'];

/**
 * 원화 포맷 유틸리티
 * 억원 / 만원 / 원 단위로 자동 변환
 */
export function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
}
