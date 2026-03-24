'use client';

/**
 * MockTradeHistory
 * 모의투자 거래 내역 테이블
 */
import { useMockTrades } from '../hooks/useMockTrades';
import { formatKRW } from '../types';

/** 날짜 시간 문자열을 "YYYY.MM.DD HH:MM" 형태로 변환 */
function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export default function MockTradeHistory() {
  const { trades, loading, error } = useMockTrades();

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">거래 내역</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">거래 내역</h2>
        <p className="text-sm text-red-600">오류: {error}</p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">거래 내역</h2>
        <p className="text-sm text-gray-500 text-center py-8">
          아직 거래 내역이 없습니다.
          <br />
          모의투자로 첫 거래를 시작해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        거래 내역 <span className="text-sm font-normal text-gray-400">(최근 20건)</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left font-medium text-gray-500">날짜</th>
              <th className="pb-2 text-left font-medium text-gray-500">종목</th>
              <th className="pb-2 text-center font-medium text-gray-500">구분</th>
              <th className="pb-2 text-right font-medium text-gray-500">수량</th>
              <th className="pb-2 text-right font-medium text-gray-500">가격</th>
              <th className="pb-2 text-right font-medium text-gray-500">금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2.5 text-xs text-gray-500 whitespace-nowrap">
                  {formatDateTime(trade.traded_at)}
                </td>
                <td className="py-2.5">
                  <div className="font-medium text-gray-900">{trade.stock_name}</div>
                  <div className="text-xs text-gray-400">{trade.stock_code}</div>
                </td>
                <td className="py-2.5 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      trade.trade_type === 'buy'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {trade.trade_type === 'buy' ? '매수' : '매도'}
                  </span>
                </td>
                <td className="py-2.5 text-right text-gray-700">
                  {trade.quantity.toLocaleString()}
                </td>
                <td className="py-2.5 text-right text-gray-700">
                  {trade.price.toLocaleString()}원
                </td>
                <td className="py-2.5 text-right font-medium text-gray-900">
                  {formatKRW(trade.quantity * trade.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
