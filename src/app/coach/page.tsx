'use client';

import { AiCoachChat } from '@/features/ai-coach';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import TutorialPopup from '@/components/common/TutorialPopup';

/** AI 코치 반디 페이지 */
export default function CoachPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">반디 코치</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          투자 궁금증을 편하게 물어보세요. KRX·DART 데이터를 기반으로 답변합니다.
        </p>
      </div>

      <DisclaimerBanner variant="default" />

      <div className="mt-4">
        <AiCoachChat />
      </div>

      {/* 반디 코치 튜토리얼 팝업 */}
      <TutorialPopup
        pageKey="coach"
        tutorialTitle="반디 코치 활용법"
        steps={[
          { emoji: '✨', title: '반디에게 뭐든 물어보세요', description: '투자 궁금증, 종목 분석, 시장 동향 등 무엇이든 자유롭게 질문하세요.' },
          { emoji: '💬', title: '대화 이어가기', description: '이전 대화 맥락을 기억하며 심층적인 분석을 제공합니다. 궁금한 점을 계속 파고들어 보세요.' },
          { emoji: '🎙️', title: '음성으로도 대화 가능', description: '마이크 버튼을 눌러 음성으로 질문할 수도 있어요. 편한 방식으로 반디와 대화하세요.' },
        ]}
      />
    </main>
  );
}
