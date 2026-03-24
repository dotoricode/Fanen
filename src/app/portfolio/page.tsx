import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/common';
import { PortfolioList } from '@/features/portfolio';

export const metadata: Metadata = {
  title: '내 포트폴리오 — 파낸',
  description: '보유 종목과 투자 현황을 관리하세요.',
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">내 포트폴리오</h1>
          <p className="mt-2 text-gray-600">보유 종목과 투자 현황을 관리하세요</p>
        </header>
        <div className="mb-6">
          <DisclaimerBanner variant="default" />
        </div>
        <PortfolioList />
      </div>
    </main>
  );
}
