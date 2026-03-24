'use client';

import { useRouter } from 'next/navigation';
import { AiCoachChat } from '@/features/ai-coach';
import { DisclaimerBanner, SubscriptionGate } from '@/components/common';
import { useSubscription } from '@/hooks/useSubscription';

/** AI 코치 핀이 페이지 — Pro 플랜 이상 필요 */
export default function CoachPage() {
  const { plan } = useSubscription();
  const router = useRouter();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">AI 코치 핀이</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          투자 궁금증을 편하게 물어보세요. KRX·DART 데이터를 기반으로 답변합니다.
        </p>
      </div>

      <DisclaimerBanner variant="default" />

      <div className="mt-4">
        <SubscriptionGate
          requiredPlan="pro"
          currentPlan={plan}
          onUpgradeClick={() => router.push('/pricing')}
        >
          <AiCoachChat />
        </SubscriptionGate>
      </div>
    </main>
  );
}
