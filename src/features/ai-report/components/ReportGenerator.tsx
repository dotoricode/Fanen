'use client';

import { useState } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import AiBadge from '@/components/common/AiBadge';
import { useAiReport } from '../hooks/useAiReport';
import type { ReportParams } from '../hooks/useAiReport';

/** AI 맞춤 리포트 생성기 — 기간/목표수익률 입력 후 리포트 생성 */
export default function ReportGenerator() {
  const { report, loading, generateReport } = useAiReport();
  const [period, setPeriod] = useState<ReportParams['period']>('3m');
  const [targetReturn, setTargetReturn] = useState(10);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    generateReport({ period, targetReturn });
  }

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 기간 선택 */}
          <div>
            <label htmlFor="period" className="mb-1 block text-sm font-medium text-gray-700">
              분석 기간
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportParams['period'])}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="1m">1개월</option>
              <option value="3m">3개월</option>
              <option value="6m">6개월</option>
              <option value="1y">1년</option>
            </select>
          </div>

          {/* 목표 수익률 */}
          <div>
            <label htmlFor="targetReturn" className="mb-1 block text-sm font-medium text-gray-700">
              목표 수익률 (%)
            </label>
            <input
              id="targetReturn"
              type="number"
              min={1}
              max={100}
              value={targetReturn}
              onChange={(e) => setTargetReturn(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '리포트 생성 중...' : 'AI 리포트 생성'}
        </button>
      </form>

      {/* 리포트 결과 */}
      {report && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
            <AiBadge label="AI 리포트" />
          </div>
          <p className="mb-4 text-sm text-gray-600">{report.summary}</p>

          <div className="space-y-4">
            {report.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="mb-1 text-base font-semibold text-gray-800">{section.heading}</h3>
                <p className="text-sm text-gray-700">{section.content}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            생성 시각: {new Date(report.generatedAt).toLocaleString('ko-KR')}
          </p>
        </div>
      )}

      {/* 면책 고지 */}
      <DisclaimerBanner />
    </div>
  );
}
