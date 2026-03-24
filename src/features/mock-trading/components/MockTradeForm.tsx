'use client';

/**
 * MockTradeForm
 * 모의투자 매수/매도 주문 폼
 */
import { useState } from 'react';
import { useMockAccount } from '../hooks/useMockAccount';
import { useMockTrades } from '../hooks/useMockTrades';
import { formatKRW } from '../types';

export default function MockTradeForm() {
  const { account, refetch: refetchAccount } = useMockAccount();
  const { executeTrade, executing, error: tradeError } = useMockTrades();

  const [stockCode, setStockCode] = useState('');
  const [stockName, setStockName] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /** 예상 금액 */
  const estimatedAmount = quantity * price;

  /** 폼 초기화 */
  const resetForm = () => {
    setStockCode('');
    setStockName('');
    setTradeType('buy');
    setQuantity(1);
    setPrice(0);
    setLocalError(null);
  };

  /** 거래 실행 핸들러 */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!account) {
      setLocalError('계좌 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    if (!stockCode.trim()) {
      setLocalError('종목코드를 입력해주세요.');
      return;
    }
    if (!stockName.trim()) {
      setLocalError('종목명을 입력해주세요.');
      return;
    }
    if (quantity < 1) {
      setLocalError('수량은 1 이상이어야 합니다.');
      return;
    }
    if (price <= 0) {
      setLocalError('가격을 입력해주세요.');
      return;
    }

    const success = await executeTrade({
      account_id: account.id,
      stock_code: stockCode.trim(),
      stock_name: stockName.trim(),
      trade_type: tradeType,
      quantity,
      price,
    });

    if (success) {
      setSuccessMsg(
        `${stockName}(${stockCode}) ${tradeType === 'buy' ? '매수' : '매도'} ${quantity}주 거래가 완료되었습니다.`,
      );
      resetForm();
      // 계좌 잔고 최신화
      await refetchAccount();
    }
  };

  const displayError = localError ?? tradeError;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">주문 입력</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 종목코드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            종목코드
          </label>
          <input
            type="text"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            placeholder="예: 005930"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 종목명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            종목명
          </label>
          <input
            type="text"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            placeholder="예: 삼성전자"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 거래 유형 토글 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">거래 유형</label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tradeType === 'buy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              매수
            </button>
            <button
              type="button"
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tradeType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              매도
            </button>
          </div>
        </div>

        {/* 수량 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">수량 (주)</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
          <input
            type="number"
            min={0}
            value={price === 0 ? '' : price}
            onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
            placeholder="원 단위 입력"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 예상 금액 */}
        {quantity > 0 && price > 0 && (
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-600">예상 금액: </span>
            <span className="font-bold text-gray-900">
              {quantity.toLocaleString()}주 × {price.toLocaleString()}원 = {formatKRW(estimatedAmount)}
            </span>
          </div>
        )}

        {/* 에러 메시지 */}
        {displayError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {displayError}
          </div>
        )}

        {/* 성공 메시지 */}
        {successMsg && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        {/* 현재 잔고 표시 */}
        {account && (
          <p className="text-xs text-gray-500">
            현재 잔고: <span className="font-medium">{formatKRW(account.current_balance)}</span>
          </p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={executing || !account}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {executing ? '처리 중...' : '거래 실행'}
        </button>
      </form>
    </div>
  );
}
