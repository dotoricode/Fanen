'use client';

import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import TutorialPopup from '@/components/common/TutorialPopup';
import {
  MockTradingDashboard,
  MockTradeForm,
  MockTradeHistory,
  MockRankingBoard,
} from '@/features/mock-trading';

/** 모의투자 페이지 */
export default function MockTradingPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">모의투자</h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">가상 자산으로 안전하게 투자를 연습하세요</p>
        </header>
        <DisclaimerBanner variant="default" />
        <MockTradingDashboard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MockTradeForm />
          <MockTradeHistory />
        </div>
        <MockRankingBoard />
      </div>

      {/* 모의투자 튜토리얼 팝업 */}
      <TutorialPopup
        pageKey="mock-trading"
        tutorialTitle="모의투자 시작하기"
        steps={[
          { emoji: '💰', title: '가상 시드머니', description: '모의투자는 실제 돈이 아닌 가상 자산으로 진행됩니다. 부담 없이 투자 전략을 연습해보세요.' },
          { emoji: '🔍', title: '종목 검색', description: '종목명을 입력하면 자동완성으로 후보 종목이 나타납니다. "삼성"이나 "현대"를 입력해보세요.' },
          { emoji: '🏆', title: '랭킹 경쟁', description: '다른 투자자들과 수익률을 비교하세요. 시즌 1위를 목표로 전략적인 투자를 해보세요!' },
        ]}
      />
    </main>
  );
}
