/**
 * AI 코치 "핀이" 페이지 (서버 컴포넌트)
 * - /coach 경로
 * - AiCoachChat 클라이언트 컴포넌트 렌더링
 */
import type { Metadata } from 'next';
import { AiCoachChat } from '@/features/ai-coach';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';

export const metadata: Metadata = {
  title: 'AI 코치 핀이 | 파낸',
  description: '개인 AI 투자 코치 핀이에게 투자 궁금증을 물어보세요.',
};

/** AI 코치 핀이 페이지 */
export default function CoachPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI 코치 핀이</h1>
        <p className="mt-1 text-sm text-gray-500">
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
