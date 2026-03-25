'use client';

import { DisclaimerBanner, AiBadge } from '@/components/common';
import { BinahMapFull } from '@/features/binah-map';

/** 비나 맵 — 세계 정세 지정학 이벤트 */
export default function BinahMapPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0F1923]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            비나 <span className="text-teal-600 dark:text-teal-400">맵</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            세계 정세 이벤트를 실시간 모니터링하고 한국 수혜 섹터를 분석합니다
          </p>
        </header>

        <div className="flex items-center gap-2">
          <DisclaimerBanner variant="signal" />
          <AiBadge label="반디 분석" variant="info" />
        </div>

        <BinahMapFull />
      </div>
    </main>
  );
}
