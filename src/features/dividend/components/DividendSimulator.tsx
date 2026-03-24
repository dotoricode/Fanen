'use client';

/**
 * DividendSimulator — 배당 수익 시뮬레이터
 * 투자원금·연배당수익률·기간·재투자 여부를 입력받아 예상 수익을 즉시 계산
 * 무료 3회 초과 시 Pro 플랜 업그레이드 유도
 */
import { useState, useEffect, useMemo } from 'react';
import { DisclaimerBanner, SubscriptionGate } from '@/components/common';
import {
  calculateDividend,
  formatKRW,
  getSimulatorCount,
  incrementSimulatorCount,
  FREE_LIMIT,
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
  // 시뮬레이터 사용 횟수 (CSR에서만 localStorage 접근)
  const [useCount, setUseCount] = useState<number>(0);
  // 제한 초과 후 잠금 상태
  const [isLocked, setIsLocked] = useState(false);

  // 마운트 시 기존 사용 횟수 로드
  useEffect(() => {
    const count = getSimulatorCount();
    setUseCount(count);
    if (count >= FREE_LIMIT) {
      setIsLocked(true);
    }
  }, []);

  // 폼 값 변경 시 사용 횟수 증가 (첫 변경 시 1회 카운트)
  function handleParamChange(updated: Partial<SimulatorParams>) {
    if (isLocked) return;
    const newParams = { ...params, ...updated };
    setParams(newParams);
  }

  /** 시뮬레이션 실행 버튼 (횟수 소모) */
  function handleCalculate() {
    if (isLocked) return;
    const next = incrementSimulatorCount();
    setUseCount(next);
    if (next >= FREE_LIMIT) {
      setIsLocked(true);
    }
  }

  // 계산 결과 (실시간)
  const result = useMemo(() => calculateDividend(params), [params]);

  // 남은 무료 횟수
  const remainingCount = Math.max(0, FREE_LIMIT - useCount);

  return (
    <div className="space-y-6">
      {/* 면책 고지 */}
      <DisclaimerBanner variant="default" />

      <SubscriptionGate requiredPlan="pro" currentPlan={isLocked ? 'free' : 'pro'}>
        {/* 잠금 상태에서는 SubscriptionGate가 업그레이드 UI를 표시하므로 children은 사용 안됨 */}
        <></>
      </SubscriptionGate>

      {/* 잠금되지 않은 경우 — 시뮬레이터 본체 */}
      {!isLocked && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-8">
          {/* 무료 사용 횟수 안내 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              무료 시뮬레이션{' '}
              <span className="font-semibold text-gray-900">{useCount}/{FREE_LIMIT}회</span> 사용
            </p>
            {remainingCount > 0 && (
              <span className="text-xs rounded-full bg-blue-50 text-blue-600 px-3 py-1 font-medium">
                {remainingCount}회 남음
              </span>
            )}
          </div>

          {/* 입력 폼 */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 투자원금 */}
            <div className="space-y-2">
              <label htmlFor="principal" className="block text-sm font-semibold text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  만원
                </span>
              </div>
              <p className="text-xs text-gray-400">
                = {formatKRW(params.principal * 10000)}
              </p>
            </div>

            {/* 연 배당수익률 */}
            <div className="space-y-2">
              <label htmlFor="annualYield" className="block text-sm font-semibold text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  %
                </span>
              </div>
            </div>

            {/* 투자 기간 */}
            <div className="space-y-2 sm:col-span-2">
              <span className="block text-sm font-semibold text-gray-700">투자 기간</span>
              <div className="flex gap-3">
                {YEAR_OPTIONS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleParamChange({ years: y })}
                    className={`flex-1 rounded-lg border py-3 text-base font-semibold transition-colors ${
                      params.years === y
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
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
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="reinvest" className="text-base font-medium text-gray-700 cursor-pointer">
                배당금 재투자 (복리 효과 적용)
              </label>
            </div>
          </div>

          {/* 시뮬레이션 실행 버튼 */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            시뮬레이션 실행 ({remainingCount}회 남음)
          </button>

          {/* 결과 요약 */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
            <h3 className="text-base font-bold text-blue-900 mb-4">예상 수익 요약</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-blue-600 font-medium">월 배당 수령액</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatKRW(result.monthlyIncome)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-blue-600 font-medium">연 배당 수령액</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatKRW(result.annualIncome)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-blue-600 font-medium">총 수익률</p>
                <p className="text-xl font-bold text-green-700">
                  +{result.totalReturn.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* 연도별 프로젝션 테이블 */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">
              연도별 예상 포트폴리오 성장
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">연도</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      포트폴리오 가치
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      연 배당금
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      누적 배당금
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.projections.map((row) => (
                    <tr key={row.year} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.year}년차</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatKRW(row.portfolioValue)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-700 font-medium">
                        {formatKRW(row.annualDividend)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-700 font-medium">
                        {formatKRW(row.cumulativeDividend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              * 세전 기준 / 실제 배당금은 시장 상황에 따라 달라질 수 있습니다
            </p>
          </div>
        </div>
      )}

      {/* 잠금 상태 — SubscriptionGate 대체 UI */}
      {isLocked && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <svg
            className="mb-4 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            무료 사용 횟수({FREE_LIMIT}회)를 모두 사용했습니다
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Pro 플랜으로 업그레이드하면 무제한으로 시뮬레이션할 수 있습니다
          </p>
          <a
            href="/pricing"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Pro 플랜 업그레이드
          </a>
        </div>
      )}
    </div>
  );
}
