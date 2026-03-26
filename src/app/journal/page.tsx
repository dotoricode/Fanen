import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';

const JournalList = dynamic(
  () => import('@/features/journal/components/JournalList'),
  { ssr: false, loading: () => <div className="animate-pulse h-64 rounded-lg bg-zinc-100 dark:bg-zinc-900" /> }
);

export const metadata: Metadata = {
  title: '투자 일지 — BINAH',
  description: '투자 기록과 감정을 기록하고 AI 분석으로 성장하세요.',
};

/** 투자 일지 페이지 — 서버 컴포넌트, 미들웨어로 인증 보호 */
export default function JournalPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">투자 일지</h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">투자 기록과 감정을 기록하고 성장하세요</p>
        </header>
        <div className="mb-6">
          <DisclaimerBanner variant="default" />
        </div>
        <JournalList />
      </div>
    </main>
  );
}
