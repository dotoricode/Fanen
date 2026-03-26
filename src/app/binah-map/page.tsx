'use client';

import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import AiBadge from '@/components/common/AiBadge';
import { BinahMapFull } from '@/features/binah-map';

/** 세계 정세 맵 — 지정학 이벤트 + 수혜 기업 분석 */
export default function BinahMapPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">

        {/* ── 헤더 ── */}
        <header className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              세계 정세
            </h1>
            <AiBadge label="반디 분석" variant="live" />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            세계 정세 이벤트를 실시간 모니터링하고 한국 수혜 섹터를 분석합니다
          </p>
        </header>

        {/* ── 반디 안내 말풍선 ── */}
        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
          {/* 반디 아이콘 */}
          <div className="shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-base">
              🪲
            </div>
          </div>
          {/* 말풍선 내용 */}
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              반디가 알려드려요
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              지도의{' '}
              <span className="font-semibold text-teal-600 dark:text-teal-400">핑(Ping)을 클릭</span>
              하거나, 아래{' '}
              <span className="font-semibold text-teal-600 dark:text-teal-400">이벤트 카드를 선택</span>
              하면 — 해당 정세가 한국 시장에 미치는{' '}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">수혜 섹터와 Value Chain</span>을 바로 분석해 드립니다.
            </p>
          </div>
        </div>

        {/* ── 면책 고지 ── */}
        <DisclaimerBanner variant="signal" />

        {/* ── 지도 + 이벤트 목록 ── */}
        <BinahMapFull />

      </div>
    </main>
  );
}
