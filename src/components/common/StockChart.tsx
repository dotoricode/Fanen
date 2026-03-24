/**
 * TradingView 차트 래퍼 컴포넌트
 * SSR 비활성화 필수: TradingView는 window 참조로 서버 렌더링 불가
 */
import dynamic from 'next/dynamic';
import type { OHLCVPoint } from '@/types/market.types';

export interface StockChartProps {
  data: OHLCVPoint[];
  type?: 'candlestick' | 'line';
  height?: number;
  title?: string;
  isMock?: boolean;
}

const StockChartInner = dynamic(
  () => import('./StockChartInner'),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse rounded-lg bg-gray-100"
        style={{ height: '280px' }}
        aria-label="차트 로딩 중"
      />
    ),
  }
);

export default function StockChart(props: StockChartProps) {
  return <StockChartInner {...props} />;
}
