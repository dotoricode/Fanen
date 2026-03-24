/**
 * news-impact feature 타입 정의
 * 뉴스 임팩트 카드 데이터 및 신호 변환 유틸리티
 */

/** 매매 신호 타입 */
export type Signal = 'buy' | 'hold' | 'sell';

/**
 * impact_score를 매매 신호로 변환
 * 0~33 = sell, 34~66 = hold, 67~100 = buy
 */
export function scoreToSignal(score: number): Signal {
  if (score >= 67) return 'buy';
  if (score >= 34) return 'hold';
  return 'sell';
}

/** 뉴스 임팩트 카드에 필요한 데이터 인터페이스 */
export interface NewsImpactCardData {
  id: string;
  headline: string;
  source: string | null;
  published_at: string | null;
  impact_score: number;
  signal: Signal;
  confidence: number;
  affected_sectors: string[];
  affected_stocks: string[];
  /** 일반인 모드 요약 */
  ai_summary_general: string;
  /** 전문가 모드 요약 (원본 텍스트) */
  ai_summary_expert: string;
  source_url: string | null;
  /** 관련 종목 코드 (KRX 차트 연동용, 선택) */
  stock_code?: string | null;
}

/**
 * ai_summary를 general/expert 모드로 분리
 * 현재는 동일 텍스트를 양쪽에 사용 (추후 분리 가능)
 */
export function splitSummary(ai_summary: string | null): { general: string; expert: string } {
  const text = ai_summary ?? '분석 정보가 없습니다.';
  return { general: text, expert: text };
}
