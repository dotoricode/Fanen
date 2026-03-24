'use client';

import { useRouter } from 'next/navigation';
import { DisclaimerBanner, SubscriptionGate } from '@/components/common';
import { SectorMapSection } from '@/features/sector-map';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * 섹터 인과관계 전용 페이지
 * Pro 플랜 이상 필요
 */
export default function SectorPage() {
  const { plan } = useSubscription();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">섹터 인과관계 맵</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            섹터 간 경제적 영향력 흐름을 인터랙티브 그래프로 탐색하세요
          </p>
        </header>

        {/* 면책 고지 */}
        <div className="mb-6">
          <DisclaimerBanner variant="default" />
        </div>

        {/* 섹터 인과관계 맵 — Pro 플랜 이상 */}
        <SubscriptionGate
          requiredPlan="pro"
          currentPlan={plan}
          onUpgradeClick={() => router.push('/pricing')}
        >
          <SectorMapSection />
        </SubscriptionGate>
      </div>
    </main>
  );
}
