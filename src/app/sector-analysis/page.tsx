import { Suspense } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import TutorialPopup from '@/components/common/TutorialPopup';
import { SectorAnalysisPageClient } from './SectorAnalysisPageClient';

/** 섹터 분석 페이지 — 서버 컴포넌트 */
export default function SectorAnalysisPage({
  searchParams,
}: {
  searchParams: { sector?: string };
}) {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* 페이지 헤더 */}
        <header>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            섹터 <span className="text-zinc-700 dark:text-zinc-300">연결망</span>
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-500">
            섹터 생태계 수혜 관계망을 방사형 마인드맵으로 탐색합니다
          </p>
        </header>

        {/* 면책 고지 — CLAUDE.md 절대 원칙 */}
        <DisclaimerBanner variant="signal" />

        {/* 클라이언트 컴포넌트에 섹터 전달 */}
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-[520px] rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
          }
        >
          <SectorAnalysisPageClient sector={searchParams.sector ?? 'defense'} />
        </Suspense>
      </div>

      {/* 섹터 분석 튜토리얼 팝업 */}
      <TutorialPopup
        pageKey="sector-analysis"
        tutorialTitle="섹터 연결망 활용법"
        steps={[
          { emoji: '🌐', title: '섹터 생태계 탐색', description: '중심 섹터를 기준으로 연관 섹터, 기업, 공급사의 관계망을 방사형으로 보여줍니다.' },
          { emoji: '🔗', title: '관계 구조 이해', description: '중심섹터(T0) → 연관섹터(T1) → 기업(T2) → 공급사(T3) 순서로 관계가 펼쳐집니다.' },
          { emoji: '🔍', title: '상세 탐색', description: '노드를 클릭하면 종목 상세 정보를 확인하고, 스크롤·핀치로 확대/축소할 수 있습니다.' },
        ]}
      />
    </main>
  );
}
