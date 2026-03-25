'use client';

/**
 * 포트폴리오 페이지 클라이언트 컴포넌트
 * 투자 성향 필터 탭 + 성향 설명 카드 + 포트폴리오 목록 표시
 * PRD S3.2: 투자 성향별 포트폴리오 필터링
 */
import { useState, useMemo } from 'react';
import { MOCK_PORTFOLIOS, INVESTMENT_STYLE_CONFIG } from '@/lib/mock/mockPortfolio';
import { formatKRW } from '../types';
import type { InvestmentStyleType, InvestmentStyleConfig } from '../types';
import PortfolioStyleFilter, { type StyleFilterOption } from './PortfolioStyleFilter';
import PortfolioList from './PortfolioList';

export default function PortfolioPageClient() {
  const [selectedStyle, setSelectedStyle] = useState<StyleFilterOption>('all');

  /* 요약 계산 (mock 데이터 기반) */
  const totalValue = MOCK_PORTFOLIOS.reduce((sum, p) => sum + p.total_value, 0);
  const investedCost = 63_000_000; // Mock 투자 원금
  const profitLoss = totalValue - investedCost;
  const profitRate = ((profitLoss / investedCost) * 100).toFixed(1);
  const isPositive = profitLoss >= 0;

  /* 성향별 카운트 계산 */
  const counts = useMemo(() => {
    const base: Record<StyleFilterOption, number> = {
      all: MOCK_PORTFOLIOS.length,
      dividend: 0,
      value: 0,
      growth: 0,
      theme: 0,
      etf: 0,
    };
    MOCK_PORTFOLIOS.forEach((p) => {
      if (p.investmentStyle) base[p.investmentStyle]++;
    });
    return base;
  }, []);

  /* 선택된 성향 설정 */
  const activeStyleConfig: InvestmentStyleConfig | null = useMemo(
    () =>
      selectedStyle !== 'all'
        ? (INVESTMENT_STYLE_CONFIG.find((c) => c.type === selectedStyle) ?? null)
        : null,
    [selectedStyle]
  );

  /* 성향 필터링된 포트폴리오 (mock 표시용) */
  const filteredMockPortfolios = useMemo(
    () =>
      selectedStyle === 'all'
        ? MOCK_PORTFOLIOS
        : MOCK_PORTFOLIOS.filter((p) => p.investmentStyle === selectedStyle),
    [selectedStyle]
  );

  return (
    <div className="space-y-6">
      {/* 수익률 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">총 평가금액</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatKRW(totalValue)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">수익률</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? '+' : ''}{profitRate}%
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">평가손익</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? '+' : ''}{formatKRW(Math.abs(profitLoss))}
          </p>
        </div>
      </div>

      {/* 투자 성향 필터 탭 */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">투자 성향별 보기</span>
        </div>
        <PortfolioStyleFilter
          selected={selectedStyle}
          onSelect={setSelectedStyle}
          counts={counts}
        />
      </div>

      {/* 선택된 성향 설명 카드 */}
      {activeStyleConfig && (
        <div className={`rounded-xl border p-4 ${activeStyleConfig.colorBg} ${activeStyleConfig.colorBorder}`}>
          <div className="flex items-start gap-3">
            <div>
              <h3 className={`text-base font-bold mb-1 ${activeStyleConfig.colorText}`}>
                {activeStyleConfig.label} 포트폴리오
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {activeStyleConfig.description}
              </p>
              <p className={`text-xs mt-2 font-medium ${activeStyleConfig.colorText}`}>
                해당 포트폴리오 {counts[activeStyleConfig.type as InvestmentStyleType]}개
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mock 필터링된 포트폴리오 요약 (성향 선택 시 표시) */}
      {selectedStyle !== 'all' && filteredMockPortfolios.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {activeStyleConfig?.label} — 보유 포트폴리오
          </p>
          {filteredMockPortfolios.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{p.name}</p>
                {p.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{p.description}</p>
                )}
              </div>
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                {formatKRW(p.total_value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 실제 포트폴리오 CRUD 목록 (Supabase 연동) */}
      <PortfolioList />
    </div>
  );
}
