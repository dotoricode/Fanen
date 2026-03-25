'use client';

import { useState } from 'react';
import AiBadge from '@/components/common/AiBadge';
import { calculateDividend, formatKRW } from '../types';
import type { ETFMockData } from '../types';
import { MOCK_ETF_LIST } from '@/lib/mock/mockDividend';

// recharts 미설치 → 테이블로 시각화

/** ETF 복리 시뮬레이터 — 재투자 여부에 따른 연도별 성장 테이블 표시 */
export default function MonthlyETFSimulator() {
  const [selectedETF, setSelectedETF] = useState<ETFMockData>(MOCK_ETF_LIST[0]!);
  const [principal, setPrincipal] = useState(1000); // 만원
  const [years, setYears] = useState(10);
  const [reinvest, setReinvest] = useState(true);

  // 재투자 O/X 결과 계산
  const resultWith = calculateDividend({
    principal,
    annualYield: selectedETF.annualYield,
    years,
    reinvest: true,
  });

  const resultWithout = calculateDividend({
    principal,
    annualYield: selectedETF.annualYield,
    years,
    reinvest: false,
  });

  // 재투자 효과 = 재투자 시 자산 - 비재투자 시 자산
  const diff =
    resultWith.projections[years - 1]!.portfolioValue -
    resultWithout.projections[years - 1]!.portfolioValue;

  // 현재 토글 선택에 따른 활성 결과
  const activeResult = reinvest ? resultWith : resultWithout;

  // 테이블 행 추출 — 5개 이하 기간은 전체, 초과 시 균등 간격 + 마지막 연도
  const tableRows = activeResult.projections.filter(
    (_, i) => i % Math.max(1, Math.floor(years / 5)) === 0 || i === years - 1,
  );

  return (
    <div className="space-y-5">
      {/* 입력 영역 */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4">
        {/* ETF 선택 드롭다운 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">ETF 선택</label>
          <select
            value={selectedETF.ticker}
            onChange={(e) => {
              const etf = MOCK_ETF_LIST.find((x) => x.ticker === e.target.value);
              if (etf) setSelectedETF(etf);
            }}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {MOCK_ETF_LIST.map((etf) => (
              <option key={etf.ticker} value={etf.ticker}>
                {etf.name} ({etf.annualYield}%)
              </option>
            ))}
          </select>
        </div>

        {/* 투자 원금 슬라이더 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            투자 원금:{' '}
            <span className="text-teal-400">{principal.toLocaleString('ko-KR')}만원</span>
          </label>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        {/* 투자 기간 슬라이더 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            투자 기간: <span className="text-teal-400">{years}년</span>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        {/* 배당 재투자 토글 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">배당 재투자</span>
          <button
            type="button"
            onClick={() => setReinvest((prev) => !prev)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              reinvest ? 'bg-teal-600' : 'bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                reinvest ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4">
        {/* 요약 카드 2개 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">{years}년 후 자산</p>
            <p className="text-lg font-bold text-teal-300">
              {formatKRW(activeResult.projections[years - 1]!.portfolioValue)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">누적 배당금</p>
            <p className="text-lg font-bold text-amber-400">
              {formatKRW(activeResult.projections[years - 1]!.cumulativeDividend)}
            </p>
          </div>
        </div>

        {/* 재투자 효과 배너 */}
        <div className="rounded-lg bg-teal-900/20 border border-teal-700/30 p-3">
          <p className="text-xs text-slate-400 mb-1">재투자 효과</p>
          <p className="text-sm text-teal-300 font-medium">
            재투자 시 {years}년 후{' '}
            <span className="font-bold">{formatKRW(diff)}</span> 더 많아요
          </p>
        </div>

        {/* 연도별 성장 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2">연도</th>
                <th className="text-right py-2">자산가치</th>
                <th className="text-right py-2">연간배당</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((p) => (
                <tr key={p.year} className="border-b border-slate-800">
                  <td className="py-1.5">{p.year}년</td>
                  <td className="text-right text-slate-300">
                    {Math.round(p.portfolioValue / 10000).toLocaleString('ko-KR')}만
                  </td>
                  <td className="text-right text-amber-400">
                    {Math.round(p.annualDividend / 10000).toLocaleString('ko-KR')}만
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AiBadge label="AI 분석" variant="info" source={selectedETF.sourceUrl} />
      </div>
    </div>
  );
}
