/**
 * 구독 플랜 상수 — Free / Pro / Premium 기능 매핑
 * 기능 구현 시 플랜 체크에 이 파일을 참조한다 (하드코딩 금지)
 */

/** 구독 플랜 타입 */
export type PlanTier = 'free' | 'pro' | 'premium';

/** 기능별 필요 플랜 정의 */
export interface PlanFeature {
  /** 기능 식별자 */
  id: string;
  /** 기능 이름 (한국어) */
  name: string;
  /** 필요한 최소 플랜 */
  requiredPlan: PlanTier;
}

/** 플랜 정보 */
export interface PlanInfo {
  /** 플랜 ID */
  tier: PlanTier;
  /** 플랜 이름 (한국어) */
  name: string;
  /** 월 가격 (원) */
  priceMonthly: number;
  /** 포함 기능 목록 */
  features: string[];
}

/** 플랜별 우선순위 — 비교 시 사용 */
export const PLAN_PRIORITY: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
} as const;

/** 플랜 상세 정보 */
export const PLANS: Record<PlanTier, PlanInfo> = {
  free: {
    tier: 'free',
    name: 'Free',
    priceMonthly: 0,
    features: [
      '기본 뉴스 요약',
      '포트폴리오 1개',
      '모의투자 참여',
      '기본 AI 분석',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    priceMonthly: 9900,
    features: [
      'Free 기능 전체',
      '포트폴리오 5개',
      '실시간 뉴스 영향 분석',
      '섹터 인과관계 맵',
      '배당 시뮬레이션',
      '매매 일지 AI 피드백',
    ],
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    priceMonthly: 19900,
    features: [
      'Pro 기능 전체',
      '포트폴리오 무제한',
      '매매 신호등 (TrafficLight)',
      '음성 AI 코치 (핀이)',
      'AI 맞춤 리포트',
      '세금 시뮬레이션',
    ],
  },
} as const;

/** 기능별 필요 플랜 매핑 */
export const FEATURE_PLAN_MAP: PlanFeature[] = [
  { id: 'news_basic', name: '기본 뉴스 요약', requiredPlan: 'free' },
  { id: 'portfolio_basic', name: '포트폴리오 관리', requiredPlan: 'free' },
  { id: 'mock_trading', name: '모의투자', requiredPlan: 'free' },
  { id: 'news_realtime', name: '실시간 뉴스 영향 분석', requiredPlan: 'pro' },
  { id: 'sector_map', name: '섹터 인과관계 맵', requiredPlan: 'pro' },
  { id: 'dividend_sim', name: '배당 시뮬레이션', requiredPlan: 'pro' },
  { id: 'trade_journal_ai', name: '매매 일지 AI 피드백', requiredPlan: 'pro' },
  { id: 'traffic_light', name: '매매 신호등', requiredPlan: 'premium' },
  { id: 'voice_coach', name: '음성 AI 코치', requiredPlan: 'premium' },
  { id: 'ai_report', name: 'AI 맞춤 리포트', requiredPlan: 'premium' },
  { id: 'tax_sim', name: '세금 시뮬레이션', requiredPlan: 'premium' },
] as const;

/**
 * 사용자 플랜이 필요 플랜 이상인지 확인
 * @param userPlan 사용자의 현재 플랜
 * @param requiredPlan 기능에 필요한 플랜
 * @returns 접근 가능 여부
 */
export function hasAccess(userPlan: PlanTier, requiredPlan: PlanTier): boolean {
  return PLAN_PRIORITY[userPlan] >= PLAN_PRIORITY[requiredPlan];
}
