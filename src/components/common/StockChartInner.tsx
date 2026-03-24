'use client';

/**
 * TradingView Lightweight Charts 실제 차트 컴포넌트
 * SSR에서 호출 불가 — StockChart.tsx에서 dynamic import로만 사용
 */
import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';
import type { OHLCVPoint } from '@/types/market.types';

interface StockChartInnerProps {
  data: OHLCVPoint[];
  type?: 'candlestick' | 'line';
  /** 차트 높이 (px). 기본값: 280 */
  height?: number;
  title?: string;
  /** true이면 "데이터 업데이트 중" 배지 표시 */
  isMock?: boolean;
}

export default function StockChartInner({
  data,
  type = 'candlestick',
  height = 280,
  title,
  isMock = false,
}: StockChartInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 데이터가 없으면 차트 초기화 스킵
    if (!containerRef.current || data.length === 0) return;

    // 차트 생성
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#374151',
      },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
      timeScale: {
        borderColor: '#e5e7eb',
      },
      rightPriceScale: {
        borderColor: '#e5e7eb',
      },
    });

    // 시리즈 추가 (v5 패턴: addSeries 사용)
    if (type === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#16a34a',
        downColor: '#dc2626',
        borderUpColor: '#16a34a',
        borderDownColor: '#dc2626',
        wickUpColor: '#16a34a',
        wickDownColor: '#dc2626',
      });
      series.setData(
        data.map((d) => ({
          time: d.time as `${number}-${number}-${number}`,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
    } else {
      const series = chart.addSeries(LineSeries, {
        color: '#2563eb',
        lineWidth: 2,
      });
      series.setData(
        data.map((d) => ({
          time: d.time as `${number}-${number}-${number}`,
          value: d.close,
        }))
      );
    }

    // 창 크기 변경 시 차트 리사이즈
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    // cleanup: 차트 제거 및 이벤트 리스너 해제
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, type, height]);

  // 데이터가 없을 때 안내 메시지
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-400"
        style={{ height }}
        aria-label="차트 데이터 없음"
      >
        데이터 없음
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* 차트 제목 */}
      {title && (
        <p className="mb-1 text-sm font-medium text-gray-700">{title}</p>
      )}

      {/* 차트 컨테이너 */}
      <div ref={containerRef} className="w-full" style={{ height }} />

      {/* 목업 데이터 배지 */}
      {isMock && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
          데이터 업데이트 중
        </div>
      )}
    </div>
  );
}
