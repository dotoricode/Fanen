/**
 * Mock 포트폴리오 데이터 — 5개 포트폴리오
 * PortfolioWithStyle 타입 준수 (investmentStyle 필드 포함)
 */
import type { PortfolioWithStyle, InvestmentStyleConfig } from '@/features/portfolio/types';

/** 포트폴리오 Mock 5개 — 각 성향 1개씩 + 추가 1개 */
export const MOCK_PORTFOLIOS: PortfolioWithStyle[] = [
  {
    id: 'mock-portfolio-1',
    user_id: 'mock-user-1',
    name: '성장주 포트폴리오',
    description: 'AI·반도체 중심 성장주 투자',
    total_value: 25_000_000,
    created_at: '2025-12-01T09:00:00Z',
    updated_at: '2026-03-20T14:30:00Z',
    investmentStyle: 'growth',
  },
  {
    id: 'mock-portfolio-2',
    user_id: 'mock-user-1',
    name: '배당주 포트폴리오',
    description: '고배당 우량주 중심 안정적 수익',
    total_value: 15_000_000,
    created_at: '2025-11-15T09:00:00Z',
    updated_at: '2026-03-18T10:00:00Z',
    investmentStyle: 'dividend',
  },
  {
    id: 'mock-portfolio-3',
    user_id: 'mock-user-1',
    name: '바이오 특화',
    description: '국내 바이오 대형주 집중 투자',
    total_value: 8_500_000,
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-15T16:00:00Z',
    investmentStyle: 'theme',
  },
  {
    id: 'mock-portfolio-4',
    user_id: 'mock-user-1',
    name: '방산·에너지',
    description: '방산·에너지 섹터 테마 투자',
    total_value: 12_000_000,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-03-22T11:00:00Z',
    investmentStyle: 'value',
  },
  {
    id: 'mock-portfolio-5',
    user_id: 'mock-user-1',
    name: '월배당 ETF',
    description: 'TIGER·KODEX 월배당 ETF 분산 투자',
    total_value: 5_000_000,
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-03-24T09:00:00Z',
    investmentStyle: 'etf',
  },
];

/** 투자 성향 설정 상수 */
export const INVESTMENT_STYLE_CONFIG: InvestmentStyleConfig[] = [
  {
    type: 'dividend',
    label: '배당형',
    description: '안정적 현금흐름을 목표로 고배당 우량주 중심으로 구성합니다.',
    color: 'teal',
    colorBg: 'bg-teal-50 dark:bg-teal-950/30',
    colorText: 'text-teal-700 dark:text-teal-300',
    colorBorder: 'border-teal-300 dark:border-teal-700',
  },
  {
    type: 'value',
    label: '가치형',
    description: '저평가 우량주를 발굴해 배당과 시세 차익을 동시에 추구합니다.',
    color: 'zinc',
    colorBg: 'bg-zinc-100 dark:bg-zinc-800',
    colorText: 'text-zinc-700 dark:text-zinc-300',
    colorBorder: 'border-zinc-300 dark:border-zinc-600',
  },
  {
    type: 'growth',
    label: '성장형',
    description: 'AI·반도체 등 고성장 섹터에 집중해 장기 시세 차익을 추구합니다.',
    color: 'amber',
    colorBg: 'bg-amber-50 dark:bg-amber-950/30',
    colorText: 'text-amber-700 dark:text-amber-300',
    colorBorder: 'border-amber-300 dark:border-amber-700',
  },
  {
    type: 'theme',
    label: '테마형',
    description: '방산·바이오 등 시장 테마를 집중 공략해 초과 수익을 목표합니다.',
    color: 'rose',
    colorBg: 'bg-rose-50 dark:bg-rose-950/30',
    colorText: 'text-rose-700 dark:text-rose-300',
    colorBorder: 'border-rose-300 dark:border-rose-700',
  },
  {
    type: 'etf',
    label: 'ETF안정형',
    description: '월배당 ETF를 중심으로 낮은 변동성과 꾸준한 현금흐름을 확보합니다.',
    color: 'teal',
    colorBg: 'bg-teal-50 dark:bg-teal-950/20',
    colorText: 'text-teal-700 dark:text-teal-300',
    colorBorder: 'border-teal-200 dark:border-teal-800',
  },
];
