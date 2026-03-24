'use client';

/**
 * DividendCalendarCard — 개별 배당 종목 카드
 */
import type { DividendCalendarRow } from '../types';
import { formatKRW } from '../types';

interface DividendCalendarCardProps {
  item: DividendCalendarRow;
}

export default function DividendCalendarCard({ item }: DividendCalendarCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs text-gray-500 font-mono">{item.stock_code}</span>
          <h3 className="font-semibold text-gray-900">{item.stock_name}</h3>
        </div>
        {item.dividend_yield !== null && (
          <span className="text-lg font-bold text-green-600">
            {item.dividend_yield.toFixed(2)}%
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-gray-500 text-xs">배당락일</dt>
          <dd className="font-medium text-gray-900">
            {item.ex_dividend_date
              ? new Date(item.ex_dividend_date).toLocaleDateString('ko-KR')
              : '-'}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500 text-xs">배당 지급일</dt>
          <dd className="font-medium text-gray-900">
            {item.payment_date
              ? new Date(item.payment_date).toLocaleDateString('ko-KR')
              : '-'}
          </dd>
        </div>
        {item.dividend_amount !== null && (
          <div className="col-span-2">
            <dt className="text-gray-500 text-xs">주당 배당금</dt>
            <dd className="font-medium text-gray-900">{formatKRW(item.dividend_amount)}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
