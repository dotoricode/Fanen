import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';

const NewsImpactList = dynamic(
  () => import('@/features/news-impact/components/NewsImpactList'),
  { ssr: false, loading: () => <div className="animate-pulse h-64 rounded-lg bg-zinc-100 dark:bg-zinc-900" /> }
);
const TutorialPopup = dynamic(
  () => import('@/components/common/TutorialPopup'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: '뉴스 분석 — 파낸',
  description: '반디 AI가 분석한 실시간 뉴스 임팩트 시그널',
};

/**
 * 뉴스 분析 페이지 (서버 컴포넌트)
 * - 탭 제거: 단일 뷰로 통합
 * - 배경: zinc-950 (다크 무채색)
 */
export default function NewsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">뉴스 분석</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            반디 AI가 파악한 실시간 시장 임팩트 시그널
          </p>
        </header>

        {/* 면책 고지 */}
        <div className="mb-6">
          <DisclaimerBanner variant="signal" />
        </div>

        {/* 뉴스 임팩트 목록 */}
        <NewsImpactList />
      </div>

      {/* AI 뉴스 분석 튜토리얼 팝업 */}
      <TutorialPopup
        pageKey="news"
        tutorialTitle="AI 뉴스 분석 활용법"
        steps={[
          { emoji: '📰', title: 'AI가 뉴스를 분석해요', description: 'AI가 글로벌 뉴스를 읽고 투자에 미치는 영향을 자동으로 분석합니다.' },
          { emoji: '📈', title: '수혜 기업 발굴', description: '뉴스 이벤트로 직접적인 혜택을 받는 기업을 자동으로 찾아드립니다.' },
          { emoji: '🚦', title: '신호등 분석', description: '매수(초록)/관망(노랑)/매도(빨강) 신호로 직관적인 투자 참고 정보를 제공합니다.' },
        ]}
      />
    </main>
  );
}
