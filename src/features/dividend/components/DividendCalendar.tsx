'use client';

/**
 * DividendCalendar — 월별 배당 일정 캘린더
 * 현재 월 기준 ±3개월 탭으로 월 선택, 해당 월의 배당 종목 목록 표시
 */
import { useMemo } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import { useDividendCalendar } from '../hooks/useDividendCalendar';
import DividendCalendarCard from './DividendCalendarCard';

/** YYYY-MM 문자열을 YYYY년 M월 형식으로 변환 */
function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-').map(Number);
  return `${year}년 ${month}월`;
}

/** 현재 월 기준 ±3개월 YYYY-MM 배열 생성 */
function buildMonthTabs(): string[] {
  const now = new Date();
  const tabs: string[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    tabs.push(`${yyyy}-${mm}`);
  }
  return tabs;
}

export default function DividendCalendar() {
  const { data, selectedMonth, setSelectedMonth, loading, error } = useDividendCalendar();
  const monthTabs = useMemo(() => buildMonthTabs(), []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">배당 캘린더</h2>
        <p className="text-gray-600 text-sm">월별 배당락일 및 지급일 일정을 확인하세요</p>
      </div>

      {/* 면책 고지 */}
      <DisclaimerBanner variant="default" />

      {/* 월 선택 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {monthTabs.map((month) => (
          <button
            key={month}
            type="button"
            onClick={() => setSelectedMonth(month)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedMonth === month
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {formatMonthLabel(month)}
          </button>
        ))}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
            >
              <div className="flex justify-between mb-3">
                <div className="space-y-1">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
                <div className="h-6 w-12 rounded bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-gray-200" />
                <div className="h-8 rounded bg-gray-200" />
                <div className="col-span-2 h-8 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 에러 상태 */}
      {!loading && error && (
        <div
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <p className="font-semibold">데이터 로드 오류</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <svg
            className="mb-3 h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <p className="text-gray-600 font-medium">{formatMonthLabel(selectedMonth)}에 배당 일정이 없습니다</p>
          <p className="mt-1 text-sm text-gray-500">다른 월을 선택하거나 나중에 다시 확인해주세요</p>
        </div>
      )}

      {/* 배당 종목 카드 목록 */}
      {!loading && !error && data.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            {formatMonthLabel(selectedMonth)} 배당 종목{' '}
            <span className="font-semibold text-gray-900">{data.length}건</span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <DividendCalendarCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
