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

// ─── 불로소득 허브 타입 (v0.0.1) ───────────────────────────

export type PortfolioType = 'dividend' | 'value' | 'growth' | 'theme' | 'etf';

export interface PortfolioTypeConfig {
  type: PortfolioType;
  label: string;
  icon: string;
  description: string;
}

export interface PassiveIncomeInput {
  targetMonthlyIncome: number;  // 목표 월 불로소득 (원)
  annualYieldPercent: number;   // 예상 연 배당수익률 (%)
  portfolioType: PortfolioType;
}

export interface PassiveIncomeResult {
  requiredInvestment: number;        // 필요 투자금 (원)
  recommendedPortfolio: PortfolioItem[];
  bandiComment: string;              // 반디 멘트
  sourceUrl: string;                 // KRX 출처 URL
}

export interface PortfolioItem {
  name: string;
  ticker: string;
  weight: number;          // 비중 (%)
  expectedYield: number;   // 예상 배당수익률 (%)
  type: PortfolioType;
}

export interface ETFMockData {
  ticker: string;
  name: string;
  annualYield: number;     // 연 분배율 (%)
  monthlyDividend: number; // 주당 월 분배금 (원)
  sourceUrl: string;       // KRX URL
}
