/** 포트폴리오 feature 타입 정의 */
import type { Database } from '@/types/database.types';

export type PortfolioRow = Database['public']['Tables']['portfolios']['Row'];
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert'];
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update'];

/**
 * 투자 성향 타입 (PRD S3.2)
 * dividend: 배당형, value: 가치형, growth: 성장형, theme: 테마형, etf: ETF안정형
 */
export type InvestmentStyleType = 'dividend' | 'value' | 'growth' | 'theme' | 'etf';

/** 투자 성향별 설정 */
export interface InvestmentStyleConfig {
  type: InvestmentStyleType;
  label: string;
  description: string;
  /** 대표 색상 (TailwindCSS 클래스) */
  color: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
}

/** 성향이 포함된 포트폴리오 Mock 타입 */
export interface PortfolioWithStyle extends PortfolioRow {
  /** 투자 성향 (mock 전용 확장 필드) */
  investmentStyle?: InvestmentStyleType;
}

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
