'use client';

import { useState } from 'react';
import AiBadge from '@/components/common/AiBadge';
import { usePassiveIncome } from '../hooks/usePassiveIncome';
import type { PortfolioType } from '../types';
import { formatKRW } from '../types';
import PortfolioTypeFilter from './PortfolioTypeFilter';

/** 연 수익률 선택 옵션 (%) */
const YIELD_OPTIONS = [3, 4, 5];

/** 목표 월 불로소득을 역산해 필요 투자금 및 추천 포트폴리오를 계산하는 컴포넌트 */
export default function PassiveIncomeCalculator() {
  const [targetMonthly, setTargetMonthly] = useState(500_000);
  const [yieldPercent, setYieldPercent] = useState(4);
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('dividend');

  const result = usePassiveIncome({
    targetMonthlyIncome: targetMonthly,
    annualYieldPercent: yieldPercent,
    portfolioType,
  });

  // 필요 투자금 단위 변환
  const requiredMan = Math.round(result.requiredInvestment / 10_000);
  const requiredEok = (result.requiredInvestment / 100_000_000).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 입력 영역 */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-5">
        {/* 목표 월 불로소득 슬라이더 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            목표 월 불로소득
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={100_000}
              max={5_000_000}
              step={100_000}
              value={targetMonthly}
              onChange={(e) => setTargetMonthly(Number(e.target.value))}
              className="flex-1 accent-teal-500"
            />
            <span className="text-lg font-bold text-teal-400 w-32 text-right">
              {formatKRW(targetMonthly)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10만원</span>
            <span>500만원</span>
          </div>
        </div>

        {/* 연 수익률 선택 버튼 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            예상 연 배당수익률
          </label>
          <div className="flex gap-2">
            {YIELD_OPTIONS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYieldPercent(y)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  yieldPercent === y
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {y}%
              </button>
            ))}
          </div>
        </div>

        {/* 투자 성향 필터 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            투자 성향
          </label>
          <PortfolioTypeFilter selected={portfolioType} onSelect={setPortfolioType} />
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="rounded-xl border border-teal-700/50 bg-teal-900/20 p-5 space-y-4">
        {/* 필요 투자금 */}
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-1">필요 투자금</p>
          <p className="text-3xl font-bold text-teal-300">
            {requiredMan.toLocaleString('ko-KR')}만원
          </p>
          <p className="text-sm text-slate-500 mt-1">≈ {requiredEok}억원</p>
        </div>

        {/* 추천 포트폴리오 구성 목록 */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">추천 포트폴리오 구성</p>
          <div className="space-y-2">
            {result.recommendedPortfolio.map((item) => (
              <div
                key={item.ticker}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium text-slate-200">{item.name}</span>
                  <span className="ml-2 text-xs text-slate-500 font-mono">{item.ticker}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-amber-400">배당 {item.expectedYield}%</span>
                  <span className="text-teal-400 font-bold">{item.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 반디 멘트 말풍선 */}
        <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
          <p className="text-xs text-slate-400 mb-1">🦋 반디의 한마디</p>
          <p className="text-sm text-slate-200">{result.bandiComment}</p>
        </div>

        {/* AI 뱃지 + 출처 */}
        <div className="flex items-center justify-between">
          <AiBadge label="AI 분석" variant="info" source={result.sourceUrl} />
          <p className="text-xs text-slate-600">수치는 참고용 Mock 데이터입니다</p>
        </div>
      </div>
    </div>
  );
}
