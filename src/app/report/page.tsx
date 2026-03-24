'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { DisclaimerBanner, SubscriptionGate } from '@/components/common';
import ReportGenerator from '@/features/ai-report/components/ReportGenerator';
import { useRouter } from 'next/navigation';

/** AI 맞춤 리포트 페이지 — Premium 전용 */
export default function ReportPage() {
  const { plan } = useSubscription();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-slate-100">AI 맞춤 리포트</h1>
      <DisclaimerBanner variant="default" />
      <SubscriptionGate
        requiredPlan="premium"
        currentPlan={plan}
        onUpgradeClick={() => router.push('/pricing')}
      >
        <ReportGenerator />
      </SubscriptionGate>
      </div>
    </main>
  );
}
