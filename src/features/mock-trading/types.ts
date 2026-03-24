/**
 * mock-trading feature 타입 정의
 * database.types.ts에서 테이블 Row 타입을 재수출하고
 * 모의투자 전용 유틸 함수를 제공한다.
 */
import type { Database } from '@/types/database.types';

/** 모의투자 시즌 Row 타입 */
export type MockSeasonRow = Database['public']['Tables']['mock_seasons']['Row'];
/** 모의투자 계좌 Row 타입 */
export type MockAccountRow = Database['public']['Tables']['mock_accounts']['Row'];
/** 모의투자 거래 Row 타입 */
export type MockTradeRow = Database['public']['Tables']['mock_trades']['Row'];
/** 모의투자 랭킹 Row 타입 */
export type MockRankingRow = Database['public']['Tables']['mock_rankings']['Row'];

/**
 * 숫자를 한국 화폐 단위 문자열로 변환
 * 1억 이상 → "X.X억원", 1만 이상 → "X만원", 그 외 → "X원"
 */
export function formatKRW(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만원`;
  return `${n.toLocaleString()}원`;
}

/**
 * 수익률 계산 (%)
 * @param initial 초기 잔고
 * @param current 현재 잔고
 */
export function calcProfitRate(initial: number, current: number): number {
  if (initial === 0) return 0;
  return ((current - initial) / initial) * 100;
}
