import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/common';
import PortfolioPageClient from '@/features/portfolio/components/PortfolioPageClient';

export const metadata: Metadata = {
  title: '내 포트폴리오 — BINAH',
  description: '보유 종목과 투자 현황을 관리하세요.',
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">내 포트폴리오</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">보유 종목과 투자 현황을 관리하세요</p>
        </header>

        {/* 면책 고지 */}
        <div className="mb-6">
          <DisclaimerBanner variant="default" />
        </div>

        {/* 성향 필터 + 포트폴리오 목록 (클라이언트 컴포넌트) */}
        <PortfolioPageClient />
      </div>
    </main>
  );
}
