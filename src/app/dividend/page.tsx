import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/common';
import { DividendCalendar, DividendSimulator } from '@/features/dividend';

export const metadata: Metadata = {
  title: '배당 캘린더 — 파낸',
  description: '배당 일정 확인과 배당 수익 시뮬레이션으로 현금흐름을 계획하세요.',
};

export default function DividendPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">배당 캘린더</h1>
          <p className="mt-2 text-gray-600">배당 일정과 수익 시뮬레이션으로 현금흐름을 계획하세요</p>
        </header>

        <DisclaimerBanner variant="default" />

        {/* 배당 캘린더 섹션 */}
        <section>
          <DividendCalendar />
        </section>

        {/* 배당 시뮬레이터 섹션 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">배당 시뮬레이터</h2>
          <DividendSimulator />
        </section>
      </div>
    </main>
  );
}
