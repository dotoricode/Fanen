'use client';

/**
 * MockTradingDashboard
 * 모의투자 대시보드: 시즌 정보, 계좌 잔고, 수익률 표시
 */
import { useMockAccount } from '../hooks/useMockAccount';
import { formatKRW, calcProfitRate } from '../types';

/** 날짜 문자열을 "YYYY.MM.DD" 형태로 변환 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return dateStr.slice(0, 10).replace(/-/g, '.');
}

export default function MockTradingDashboard() {
  const { account, season, loading, error } = useMockAccount();

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 rounded-lg bg-gray-100 dark:bg-zinc-800" />
            <div className="h-20 rounded-lg bg-gray-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">오류: {error}</p>
      </div>
    );
  }

  if (!account || !season) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-zinc-500">
          활성 시즌이 없거나 로그인이 필요합니다. 로그인 후 자동으로 계좌가 생성됩니다.
        </p>
      </div>
    );
  }

  const profitRate = calcProfitRate(account.initial_balance, account.current_balance);
  const isPositive = profitRate >= 0;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-5">
      {/* 시즌 배지 */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {season.name}
        </span>
        <span className="text-sm text-gray-500 dark:text-zinc-500">
          {formatDate(season.start_date)} ~ {formatDate(season.end_date)}
        </span>
      </div>

      {/* 잔고 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 dark:bg-zinc-950 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wide">초기 시드머니</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {formatKRW(account.initial_balance)}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-zinc-950 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wide">현재 잔고</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {formatKRW(account.current_balance)}
          </p>
        </div>
      </div>

      {/* 수익률 비교 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 dark:bg-zinc-950 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wide">내 수익률</p>
          <p className={`mt-1 text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{profitRate.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-zinc-950 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wide">코스피 수익률</p>
          <p className="mt-1 text-2xl font-bold text-green-600">+2.10%</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
            {isPositive && profitRate > 2.1
              ? `코스피 대비 +${(profitRate - 2.1).toFixed(2)}%p 초과 수익`
              : '코스피 대비 수익률을 비교해보세요'}
          </p>
        </div>
      </div>

      {/* 모의투자 안내 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p>
          <span className="font-semibold">안내</span>{' '}
          모의투자는 가상 자산으로 진행되며 실제 투자가 아닙니다.
        </p>
      </div>
    </div>
  );
}
