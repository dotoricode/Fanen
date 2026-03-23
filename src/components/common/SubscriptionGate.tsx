'use client';

import type { ReactNode } from 'react';

/**
 * 구독 플랜 게이트 컴포넌트
 * 필요한 플랜 미달 시 업그레이드 유도 UI 표시
 *
 * @example
 * <SubscriptionGate requiredPlan="premium" currentPlan="free">
 *   <PremiumContent />
 * </SubscriptionGate>
 */

/** 구독 플랜 타입 */
type PlanTier = 'free' | 'pro' | 'premium';

/** 플랜 우선순위 (높을수록 상위 플랜) */
const PLAN_PRIORITY: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

/** SubscriptionGate Props */
interface SubscriptionGateProps {
  /** 필요한 플랜 */
  requiredPlan: PlanTier;
  /** 현재 사용자 플랜 */
  currentPlan: PlanTier;
  /** 조건 충족 시 렌더링할 자식 요소 */
  children: ReactNode;
  /** 업그레이드 버튼 클릭 콜백 */
  onUpgradeClick?: () => void;
}

/** 플랜별 한국어 라벨 */
const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

/** 구독 플랜 게이트 — 미달 시 업그레이드 유도 */
export default function SubscriptionGate({
  requiredPlan,
  currentPlan,
  children,
  onUpgradeClick,
}: SubscriptionGateProps) {
  // 현재 플랜이 필요 플랜 이상이면 자식 요소 렌더링
  if (PLAN_PRIORITY[currentPlan] >= PLAN_PRIORITY[requiredPlan]) {
    return <>{children}</>;
  }

  // 미달 시 잠금 UI
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      {/* 잠금 아이콘 */}
      <svg
        className="mb-4 h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p className="mb-2 text-lg font-semibold text-gray-700">
        {PLAN_LABELS[requiredPlan]} 기능입니다
      </p>
      <p className="mb-4 text-sm text-gray-500">
        이 기능을 사용하려면 {PLAN_LABELS[requiredPlan]} 플랜으로 업그레이드가 필요합니다.
      </p>
      {onUpgradeClick && (
        <button
          type="button"
          onClick={onUpgradeClick}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          업그레이드하기
        </button>
      )}
    </div>
  );
}
