'use client';

import { useRouter } from 'next/navigation';
import { PLANS, PLAN_PRIORITY } from '@/lib/plans';
import type { PlanTier } from '@/lib/plans';
import { useSubscription } from '@/hooks/useSubscription';
import PlanBadge from '@/components/common/PlanBadge';

/** 플랜 카드 스타일 */
const CARD_STYLES: Record<PlanTier, { border: string; button: string }> = {
  free: {
    border: 'border-gray-200',
    button: 'bg-gray-600 hover:bg-gray-700 text-white',
  },
  pro: {
    border: 'border-blue-400 ring-2 ring-blue-100',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  premium: {
    border: 'border-yellow-400 ring-2 ring-yellow-100',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
};

/** 가격 포맷 */
function formatPrice(price: number): string {
  if (price === 0) return '무료';
  return `${price.toLocaleString('ko-KR')}원/월`;
}

/** 요금제 비교 페이지 */
export default function PricingPage() {
  const { plan: currentPlan, loading } = useSubscription();
  const router = useRouter();
  const tiers: PlanTier[] = ['free', 'pro', 'premium'];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 베타 안내 배너 */}
        <div className="mb-8 rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm font-medium text-blue-800">
            현재 베타 기간으로 모든 기능을 무료로 제공할 예정입니다
          </p>
        </div>

        {/* 페이지 제목 */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">요금제</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            나에게 맞는 플랜을 선택하세요
          </p>
        </header>

        {/* 요금제 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const planInfo = PLANS[tier];
            const styles = CARD_STYLES[tier];
            const isCurrent = currentPlan === tier;
            const isDowngrade = PLAN_PRIORITY[tier] < PLAN_PRIORITY[currentPlan];

            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-xl border-2 bg-white dark:bg-slate-800 p-6 shadow-sm ${styles.border}`}
              >
                {/* 현재 플랜 표시 */}
                {isCurrent && !loading && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      현재 플랜
                    </span>
                  </div>
                )}

                {/* 플랜 이름 + 뱃지 */}
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{planInfo.name}</h2>
                  <PlanBadge plan={tier} size="sm" />
                </div>

                {/* 가격 */}
                <p className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-6">
                  {formatPrice(planInfo.priceMonthly)}
                </p>

                {/* 기능 목록 */}
                <ul className="flex-1 space-y-3 mb-6">
                  {planInfo.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* 선택 버튼 */}
                <button
                  type="button"
                  disabled={isCurrent || loading}
                  onClick={() => {
                    if (!isCurrent && !isDowngrade) {
                      router.push('/pricing');
                    }
                  }}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                      : styles.button
                  }`}
                >
                  {isCurrent ? '사용 중' : isDowngrade ? '다운그레이드' : '업그레이드'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
