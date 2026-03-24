'use client';

import { AiCoachChat } from '@/features/ai-coach';
import { DisclaimerBanner } from '@/components/common';

/** AI 코치 반디 페이지 */
export default function CoachPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">반디 코치</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          투자 궁금증을 편하게 물어보세요. KRX·DART 데이터를 기반으로 답변합니다.
        </p>
      </div>

      <DisclaimerBanner variant="default" />

      <div className="mt-4">
        <AiCoachChat />
      </div>
    </main>
  );
}
