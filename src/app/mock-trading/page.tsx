/**
 * 모의투자 페이지 — 서버 컴포넌트
 * 미들웨어에 의해 인증 보호됨
 */
import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/common';
import {
  MockTradingDashboard,
  MockTradeForm,
  MockTradeHistory,
  MockRankingBoard,
} from '@/features/mock-trading';

export const metadata: Metadata = {
  title: '모의투자 — 파낸',
  description: '가상 자산으로 안전하게 투자를 연습하세요.',
};

export default function MockTradingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">모의투자</h1>
          <p className="mt-2 text-gray-600">가상 자산으로 안전하게 투자를 연습하세요</p>
        </header>
        <DisclaimerBanner variant="default" />
        <MockTradingDashboard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MockTradeForm />
          <MockTradeHistory />
        </div>
        <MockRankingBoard />
      </div>
    </main>
  );
}
