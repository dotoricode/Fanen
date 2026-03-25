import { Suspense } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import { ValueChainPageClient } from './ValueChainPageClient';

/** 밸류체인 페이지 — 서버 컴포넌트 */
export default function ValueChainPage({
  searchParams,
}: {
  searchParams: { sector?: string };
}) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0F1923]">
      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* 페이지 헤더 */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            밸류체인 <span className="text-teal-600 dark:text-teal-400">분석</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            세계 이벤트 트리거별 국내 수혜 기업 밸류체인을 계층 구조로 분석합니다
          </p>
        </header>

        {/* 면책 고지 — CLAUDE.md 절대 원칙 */}
        <DisclaimerBanner variant="signal" />

        {/* 클라이언트 컴포넌트에 섹터 전달 */}
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          }
        >
          <ValueChainPageClient sector={searchParams.sector ?? 'defense'} />
        </Suspense>
      </div>
    </main>
  );
}
