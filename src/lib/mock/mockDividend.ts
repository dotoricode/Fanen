/**
 * Mock 배당 캘린더 데이터 — 12건 (월별 1건)
 * DividendCalendarRow 타입 준수
 * 수치는 참고용 Mock 데이터이며, 실제 배당 정보가 아닙니다.
 */
import type { DividendCalendarRow } from '@/features/dividend/types';
import type { SimulatorResult } from '@/features/dividend/types';

/** 배당 캘린더 Mock 12건 */
export const MOCK_DIVIDEND_CALENDAR: DividendCalendarRow[] = [
  {
    id: 'mock-div-1',
    stock_code: '005930',
    stock_name: '삼성전자',
    ex_dividend_date: '2026-01-15',
    payment_date: '2026-02-15',
    dividend_amount: 361,
    dividend_yield: 2.1,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-2',
    stock_code: '105560',
    stock_name: 'KB금융',
    ex_dividend_date: '2026-02-20',
    payment_date: '2026-03-20',
    dividend_amount: 3000,
    dividend_yield: 5.2,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-3',
    stock_code: '055550',
    stock_name: '신한지주',
    ex_dividend_date: '2026-03-18',
    payment_date: '2026-04-18',
    dividend_amount: 2400,
    dividend_yield: 4.8,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-4',
    stock_code: '015760',
    stock_name: '한국전력',
    ex_dividend_date: '2026-04-10',
    payment_date: '2026-05-10',
    dividend_amount: 500,
    dividend_yield: 1.5,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-5',
    stock_code: '017670',
    stock_name: 'SK텔레콤',
    ex_dividend_date: '2026-05-15',
    payment_date: '2026-06-15',
    dividend_amount: 3500,
    dividend_yield: 4.3,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-6',
    stock_code: '032830',
    stock_name: '삼성생명',
    ex_dividend_date: '2026-06-12',
    payment_date: '2026-07-12',
    dividend_amount: 3200,
    dividend_yield: 3.9,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-7',
    stock_code: '003550',
    stock_name: 'LG',
    ex_dividend_date: '2026-07-20',
    payment_date: '2026-08-20',
    dividend_amount: 1500,
    dividend_yield: 2.8,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-8',
    stock_code: '086790',
    stock_name: '하나금융지주',
    ex_dividend_date: '2026-08-18',
    payment_date: '2026-09-18',
    dividend_amount: 2800,
    dividend_yield: 5.0,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-9',
    stock_code: '000270',
    stock_name: '기아',
    ex_dividend_date: '2026-09-15',
    payment_date: '2026-10-15',
    dividend_amount: 5000,
    dividend_yield: 4.5,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-10',
    stock_code: '005490',
    stock_name: 'POSCO홀딩스',
    ex_dividend_date: '2026-10-10',
    payment_date: '2026-11-10',
    dividend_amount: 8000,
    dividend_yield: 3.2,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-11',
    stock_code: '066570',
    stock_name: 'LG전자',
    ex_dividend_date: '2026-11-12',
    payment_date: '2026-12-12',
    dividend_amount: 1000,
    dividend_yield: 1.8,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'mock-div-12',
    stock_code: '005380',
    stock_name: '현대차',
    ex_dividend_date: '2026-12-20',
    payment_date: '2027-01-20',
    dividend_amount: 7000,
    dividend_yield: 3.5,
    created_at: '2025-12-01T00:00:00Z',
  },
];

import type { PortfolioType, PortfolioItem, ETFMockData } from '@/features/dividend/types';

// ─── 불로소득 허브 Mock 데이터 (v0.0.1) ───────────────────────────

/** ETF 5종 mock — KRX 기준 참고 데이터 (실제 수치 아님) */
export const MOCK_ETF_LIST: ETFMockData[] = [
  { ticker: '458730', name: 'TIGER 미국배당다우존스', annualYield: 3.8, monthlyDividend: 55, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '441680', name: 'KODEX 미국배당프리미엄', annualYield: 8.2, monthlyDividend: 130, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '395160', name: 'TIGER 리츠부동산인프라', annualYield: 5.1, monthlyDividend: 42, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '329200', name: 'TIGER 미국채10년선물', annualYield: 3.2, monthlyDividend: 28, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '148020', name: 'KBSTAR 고배당', annualYield: 4.5, monthlyDividend: 60, sourceUrl: 'https://www.krx.co.kr' },
];

const KRX_URL = 'https://www.krx.co.kr';

/** 투자 성향별 추천 포트폴리오 mock */
export const MOCK_PORTFOLIOS: Record<PortfolioType, PortfolioItem[]> = {
  dividend: [
    { name: 'KBSTAR 고배당', ticker: '148020', weight: 40, expectedYield: 4.5, type: 'dividend' },
    { name: 'TIGER 리츠부동산인프라', ticker: '395160', weight: 30, expectedYield: 5.1, type: 'dividend' },
    { name: 'KB금융', ticker: '105560', weight: 20, expectedYield: 5.2, type: 'dividend' },
    { name: '신한지주', ticker: '055550', weight: 10, expectedYield: 4.8, type: 'dividend' },
  ],
  value: [
    { name: 'POSCO홀딩스', ticker: '005490', weight: 35, expectedYield: 3.2, type: 'value' },
    { name: '현대차', ticker: '005380', weight: 30, expectedYield: 3.5, type: 'value' },
    { name: '기아', ticker: '000270', weight: 20, expectedYield: 4.5, type: 'value' },
    { name: 'LG전자', ticker: '066570', weight: 15, expectedYield: 1.8, type: 'value' },
  ],
  growth: [
    { name: 'TIGER 미국배당다우존스', ticker: '458730', weight: 50, expectedYield: 3.8, type: 'growth' },
    { name: 'SK텔레콤', ticker: '017670', weight: 30, expectedYield: 4.3, type: 'growth' },
    { name: 'LG', ticker: '003550', weight: 20, expectedYield: 2.8, type: 'growth' },
  ],
  theme: [
    { name: 'KODEX 미국배당프리미엄', ticker: '441680', weight: 40, expectedYield: 8.2, type: 'theme' },
    { name: '삼성생명', ticker: '032830', weight: 30, expectedYield: 3.9, type: 'theme' },
    { name: '하나금융지주', ticker: '086790', weight: 30, expectedYield: 5.0, type: 'theme' },
  ],
  etf: [
    { name: 'TIGER 미국배당다우존스', ticker: '458730', weight: 30, expectedYield: 3.8, type: 'etf' },
    { name: 'KODEX 미국배당프리미엄', ticker: '441680', weight: 30, expectedYield: 8.2, type: 'etf' },
    { name: 'TIGER 리츠부동산인프라', ticker: '395160', weight: 20, expectedYield: 5.1, type: 'etf' },
    { name: 'KBSTAR 고배당', ticker: '148020', weight: 20, expectedYield: 4.5, type: 'etf' },
  ],
};

/** 배당 시뮬레이션 결과 예시 (1,000만원 투자, 연 4%, 10년, 재투자) */
export const MOCK_SIMULATOR_RESULT: SimulatorResult = {
  monthlyIncome: 33_333,
  annualIncome: 400_000,
  totalReturn: 48.02,
  projections: [
    { year: 1, portfolioValue: 10_400_000, annualDividend: 400_000, cumulativeDividend: 400_000 },
    { year: 2, portfolioValue: 10_816_000, annualDividend: 416_000, cumulativeDividend: 816_000 },
    { year: 3, portfolioValue: 11_248_640, annualDividend: 432_640, cumulativeDividend: 1_248_640 },
    { year: 4, portfolioValue: 11_698_586, annualDividend: 449_946, cumulativeDividend: 1_698_586 },
    { year: 5, portfolioValue: 12_166_529, annualDividend: 467_943, cumulativeDividend: 2_166_529 },
    { year: 6, portfolioValue: 12_653_190, annualDividend: 486_661, cumulativeDividend: 2_653_190 },
    { year: 7, portfolioValue: 13_159_318, annualDividend: 506_128, cumulativeDividend: 3_159_318 },
    { year: 8, portfolioValue: 13_685_690, annualDividend: 526_373, cumulativeDividend: 3_685_690 },
    { year: 9, portfolioValue: 14_233_118, annualDividend: 547_428, cumulativeDividend: 4_233_118 },
    { year: 10, portfolioValue: 14_802_443, annualDividend: 569_325, cumulativeDividend: 4_802_443 },
  ],
};
