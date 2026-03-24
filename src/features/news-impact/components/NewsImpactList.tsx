'use client';

/**
 * NewsImpactList 컴포넌트
 * 뉴스 임팩트 카드 목록 및 구독 게이트, 언어 토글 통합
 * 종목 코드가 있는 뉴스 항목에는 "차트 보기" 토글 기능 포함
 */
import { useState, useEffect } from 'react';
import { DisclaimerBanner, LanguageToggle, SubscriptionGate, StockChart } from '@/components/common';
import { useNewsImpacts } from '../hooks/useNewsImpacts';
import NewsImpactCard from './NewsImpactCard';
import type { StockPriceResponse } from '@/types/market.types';
import type { NewsImpactCardData } from '../types';

interface NewsImpactListProps {
  currentPlan?: 'free' | 'pro' | 'premium';
}

// Railway API URL (클라이언트에서 직접 호출)
const RAILWAY_API_URL =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'http://localhost:8000';

/**
 * 개별 뉴스 아이템 래퍼 — 종목 차트 토글 포함
 */
function NewsItemWithChart({
  item,
  languageLevel,
}: {
  item: NewsImpactCardData;
  languageLevel: 'general' | 'expert';
}) {
  const [chartOpen, setChartOpen] = useState(false);
  const [chartData, setChartData] = useState<StockPriceResponse | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  // 차트 펼칠 때 종목 데이터 fetch (클라이언트에서 Railway 직접 호출)
  useEffect(() => {
    if (!chartOpen || !item.stock_code || chartData) return;

    setChartLoading(true);
    fetch(`${RAILWAY_API_URL}/api/krx/stock?code=${item.stock_code}`)
      .then((res) => {
        if (!res.ok) throw new Error('종목 데이터 조회 실패');
        return res.json() as Promise<StockPriceResponse>;
      })
      .then((data) => setChartData(data))
      .catch(() => {
        // Railway 미실행 시 에러 무시 — 차트 숨김 유지
      })
      .finally(() => setChartLoading(false));
  }, [chartOpen, item.stock_code, chartData]);

  return (
    <div>
      {/* 기존 뉴스 카드 */}
      <NewsImpactCard item={item} languageLevel={languageLevel} />

      {/* 종목 코드가 있을 때만 차트 토글 버튼 표시 */}
      {item.stock_code && (
        <div className="mt-1 mb-2 px-1">
          <button
            type="button"
            onClick={() => setChartOpen((prev) => !prev)}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
            aria-expanded={chartOpen}
          >
            {chartOpen ? '차트 닫기 ▲' : `차트 보기 (${item.stock_code}) ▼`}
          </button>

          {/* 차트 확장 영역 */}
          {chartOpen && (
            <div className="mt-2">
              {chartLoading && (
                <div className="rounded-lg border border-gray-200 bg-gray-100 animate-pulse h-32" />
              )}
              {!chartLoading && chartData && (
                <StockChart
                  data={chartData.chart_data}
                  title={chartData.name || item.stock_code}
                  type="line"
                  isMock={chartData.mock}
                />
              )}
              {!chartLoading && !chartData && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-400 text-center">
                  차트 데이터를 불러올 수 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NewsImpactList({ currentPlan }: NewsImpactListProps) {
  // 언어 레벨 상태 (일반인/전문가 모드)
  const [languageLevel, setLanguageLevel] = useState<'general' | 'expert'>('general');
  const { data, loading, error } = useNewsImpacts();

  return (
    <section className="space-y-4">
      {/* 상단: 타이틀 + LanguageToggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">뉴스 임팩트</h2>
        <LanguageToggle
          onChange={(level) => setLanguageLevel(level)}
          defaultLevel="general"
        />
      </div>

      {/* 면책 고지 — 분석 화면 필수 */}
      <DisclaimerBanner variant="signal" />

      {/* 구독 게이트 — Pro 이상 필요 */}
      <SubscriptionGate requiredPlan="pro" currentPlan={currentPlan ?? 'free'}>
        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* 에러 메시지 */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {/* 빈 데이터 안내 */}
        {!loading && !error && data.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            표시할 뉴스 임팩트 정보가 없습니다.
          </div>
        )}

        {/* 카드 목록 — 종목 차트 토글 래퍼 사용 */}
        {!loading && data.length > 0 && (
          <div className="space-y-3">
            {data.map((item) => (
              <NewsItemWithChart
                key={item.id}
                item={item}
                languageLevel={languageLevel}
              />
            ))}
          </div>
        )}
      </SubscriptionGate>
    </section>
  );
}
