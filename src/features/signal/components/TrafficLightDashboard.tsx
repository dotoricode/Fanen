'use client';

import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import AiBadge from '@/components/common/AiBadge';
import { useSignal } from '../hooks/useSignal';
import SignalCard from './SignalCard';

/** 매매 신호등 대시보드 — SignalCard 목록 + 면책 고지 */
export default function TrafficLightDashboard() {
  const { data, loading } = useSignal();

  if (loading) {
    return <p className="text-center text-gray-500">신호 분석 중...</p>;
  }

  return (
    <div className="space-y-4">
      {/* AI 분석 뱃지 */}
      <div className="flex items-center gap-2">
        <AiBadge label="AI 매매 신호" />
        <span className="text-sm text-gray-500">총 {data.length}개 종목 분석</span>
      </div>

      {/* 신호 카드 목록 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <SignalCard key={item.stockCode} item={item} />
        ))}
      </div>

      {/* 면책 고지 — signal variant 필수 */}
      <DisclaimerBanner variant="signal" />
    </div>
  );
}
