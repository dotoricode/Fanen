import type { Database } from '@/types/database.types';

export type DividendCalendarRow = Database['public']['Tables']['dividend_calendar']['Row'];

export interface SimulatorParams {
  principal: number;        // 투자원금 (만원)
  annualYield: number;      // 연 배당수익률 (%)
  years: number;            // 투자 기간 (년)
  reinvest: boolean;        // 배당 재투자 여부
}

export interface YearlyProjection {
  year: number;
  portfolioValue: number;
  annualDividend: number;
  cumulativeDividend: number;
}

export interface SimulatorResult {
  monthlyIncome: number;
  annualIncome: number;
  totalReturn: number;
  projections: YearlyProjection[];
}

/** 배당 시뮬레이터 계산 — 순수 수학 함수 (AI 미사용) */
export function calculateDividend(params: SimulatorParams): SimulatorResult {
  const principalWon = params.principal * 10000;
  const rate = params.annualYield / 100;
  const projections: YearlyProjection[] = [];
  let portfolioValue = principalWon;
  let cumulativeDividend = 0;

  for (let year = 1; year <= params.years; year++) {
    const annualDividend = portfolioValue * rate;
    cumulativeDividend += annualDividend;
    if (params.reinvest) portfolioValue += annualDividend;
    projections.push({ year, portfolioValue, annualDividend, cumulativeDividend });
  }

  return {
    monthlyIncome: (principalWon * rate) / 12,
    annualIncome: principalWon * rate,
    totalReturn: ((portfolioValue - principalWon) / principalWon) * 100,
    projections,
  };
}

/** 숫자를 한국어 금액으로 포맷 (예: 1,234,567원) */
export function formatKRW(amount: number): string {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`;
}

/** 배당 시뮬레이터 사용 횟수 관리 (localStorage) */
const SIMULATOR_KEY = 'fanen-sim-count';
export const FREE_LIMIT = 3;

export function getSimulatorCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(SIMULATOR_KEY) ?? '0', 10);
}

export function incrementSimulatorCount(): number {
  const next = getSimulatorCount() + 1;
  localStorage.setItem(SIMULATOR_KEY, String(next));
  return next;
}
