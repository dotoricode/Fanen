'use client';

import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import ReportGenerator from '@/features/ai-report/components/ReportGenerator';

/** AI 맞춤 리포트 페이지 */
export default function ReportPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-100">AI 맞춤 리포트</h1>
        <DisclaimerBanner variant="default" />
        <ReportGenerator />
      </div>
    </main>
  );
}
