'use client';

/**
 * DividendSimulator — 배당 수익 시뮬레이터
 * 투자원금·연배당수익률·기간·재투자 여부를 입력받아 예상 수익을 즉시 계산
 * 완전 무료 — 횟수 제한 없음
 */
import { useState, useMemo } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import {
  calculateDividend,
  formatKRW,
} from '../types';
import type { SimulatorParams } from '../types';

/** 투자 기간 선택 버튼 옵션 */
const YEAR_OPTIONS = [10, 20, 30] as const;

/** 초기 폼 값 */
const INITIAL_PARAMS: SimulatorParams = {
  principal: 1000,
  annualYield: 4,
  years: 10,
  reinvest: false,
};

export default function DividendSimulator() {
  const [params, setParams] = useState<SimulatorParams>(INITIAL_PARAMS);

  function handleParamChange(updated: Partial<SimulatorParams>) {
    setParams((prev) => ({ ...prev, ...updated }));
  }

  const result = useMemo(() => calculateDividend(params), [params]);

  return (
    <div className="space-y-6">
      {/* 면책 고지 */}
      <DisclaimerBanner variant="default" />

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-8">
        {/* 입력 폼 */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* 투자원금 */}
          <div className="space-y-2">
            <label htmlFor="principal" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              투자원금 (만원)
            </label>
            <div className="relative">
              <input
                id="principal"
                type="number"
                min={100}
                max={100000}
                step={100}
                value={params.principal}
                onChange={(e) =>
                  handleParamChange({ principal: Math.max(0, Number(e.target.value)) })
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                만원
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              = {formatKRW(params.principal * 10000)}
            </p>
          </div>

          {/* 연 배당수익률 */}
          <div className="space-y-2">
            <label htmlFor="annualYield" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              연 배당수익률 (%)
            </label>
            <div className="relative">
              <input
                id="annualYield"
                type="number"
                min={0.1}
                max={30}
                step={0.1}
                value={params.annualYield}
                onChange={(e) =>
                  handleParamChange({ annualYield: Math.max(0, Number(e.target.value)) })
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-base font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                %
              </span>
            </div>
          </div>

          {/* 투자 기간 */}
          <div className="space-y-2 sm:col-span-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">투자 기간</span>
            <div className="flex gap-3">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleParamChange({ years: y })}
                  className={`flex-1 rounded-lg border py-3 text-base font-semibold transition-colors ${
                    params.years === y
                      ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-600'
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  {y}년
                </button>
              ))}
            </div>
          </div>

          {/* 배당 재투자 여부 */}
          <div className="sm:col-span-2 flex items-center gap-3">
            <input
              id="reinvest"
              type="checkbox"
              checked={params.reinvest}
              onChange={(e) => handleParamChange({ reinvest: e.target.checked })}
              className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-600 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="reinvest" className="text-base font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              배당금 재투자 (복리 효과 적용)
            </label>
          </div>
        </div>

        {/* 결과 요약 */}
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 p-5">
          <h3 className="text-base font-bold text-teal-900 dark:text-teal-200 mb-4">예상 수익 요약</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">월 배당 수령액</p>
              <p className="text-xl font-bold text-teal-900 dark:text-teal-200">
                {formatKRW(result.monthlyIncome)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">연 배당 수령액</p>
              <p className="text-xl font-bold text-teal-900 dark:text-teal-200">
                {formatKRW(result.annualIncome)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">총 수익률</p>
              <p className="text-xl font-bold text-teal-700 dark:text-teal-300">
                +{result.totalReturn.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* 연도별 프로젝션 테이블 */}
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            연도별 예상 포트폴리오 성장
          </h3>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">연도</th>
                  <th className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-400">
                    포트폴리오 가치
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-400">
                    연 배당금
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-zinc-600 dark:text-zinc-400">
                    누적 배당금
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {result.projections.map((row) => (
                  <tr key={row.year} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{row.year}년차</td>
                    <td className="px-4 py-3 text-right text-zinc-900 dark:text-zinc-100">
                      {formatKRW(row.portfolioValue)}
                    </td>
                    <td className="px-4 py-3 text-right text-teal-700 dark:text-teal-400 font-medium">
                      {formatKRW(row.annualDividend)}
                    </td>
                    <td className="px-4 py-3 text-right text-teal-700 dark:text-teal-400 font-medium">
                      {formatKRW(row.cumulativeDividend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            * 세전 기준 / 실제 배당금은 시장 상황에 따라 달라질 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
