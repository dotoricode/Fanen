'use client';

import { useRouter } from 'next/navigation';
import { DisclaimerBanner, SubscriptionGate } from '@/components/common';
import { DividendCalendar, DividendSimulator } from '@/features/dividend';
import { useSubscription } from '@/hooks/useSubscription';

/** 배당 캘린더 페이지 — 시뮬레이터는 Pro 플랜 이상 필요 */
export default function DividendPage() {
  const { plan } = useSubscription();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">배당 캘린더</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">배당 일정과 수익 시뮬레이션으로 현금흐름을 계획하세요</p>
        </header>

        <DisclaimerBanner variant="default" />

        {/* 배당 캘린더 섹션 — 무료 */}
        <section>
          <DividendCalendar />
        </section>

        {/* 배당 시뮬레이터 섹션 — Pro 플랜 이상 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">배당 시뮬레이터</h2>
          <SubscriptionGate
            requiredPlan="pro"
            currentPlan={plan}
            onUpgradeClick={() => router.push('/pricing')}
          >
            <DividendSimulator />
          </SubscriptionGate>
        </section>
      </div>
    </main>
  );
}
