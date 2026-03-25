'use client';

/**
 * MockTradeForm
 * 모의투자 매수/매도 주문 폼 (다크모드 지원 + 종목 자동완성)
 */
import { useState, useRef, useEffect } from 'react';
import { useMockAccount } from '../hooks/useMockAccount';
import { useMockTrades } from '../hooks/useMockTrades';
import { formatKRW } from '../types';

/** 자동완성용 종목 목록 */
const STOCK_LIST = [
  { code: '005930', name: '삼성전자', group: '반도체' },
  { code: '000660', name: 'SK하이닉스', group: '반도체' },
  { code: '035420', name: 'NAVER', group: 'IT' },
  { code: '035720', name: '카카오', group: 'IT' },
  { code: '005380', name: '현대자동차', group: '자동차' },
  { code: '000270', name: '기아', group: '자동차' },
  { code: '051910', name: 'LG화학', group: '화학' },
  { code: '068270', name: '셀트리온', group: '바이오' },
  { code: '207940', name: '삼성바이오로직스', group: '바이오' },
  { code: '006400', name: '삼성SDI', group: '2차전지' },
  { code: '373220', name: 'LG에너지솔루션', group: '2차전지' },
  { code: '012330', name: '현대모비스', group: '자동차부품' },
  { code: '028260', name: '삼성물산', group: '건설' },
  { code: '066570', name: 'LG전자', group: '전자' },
  { code: '096770', name: 'SK이노베이션', group: '에너지' },
  { code: '003550', name: 'LG', group: '지주회사' },
  { code: '015760', name: '한국전력', group: '에너지' },
  { code: '032830', name: '삼성생명', group: '금융' },
  { code: '055550', name: '신한지주', group: '금융' },
  { code: '105560', name: 'KB금융', group: '금융' },
  { code: '000100', name: '유한양행', group: '제약' },
  { code: '034730', name: 'SK', group: '지주회사' },
  { code: '011200', name: 'HMM', group: '해운' },
  { code: '329180', name: 'HD현대중공업', group: '조선' },
  { code: '267250', name: 'HD현대', group: '지주회사' },
  { code: '042660', name: 'HD현대미포', group: '조선' },
  { code: '322000', name: 'HD현대일렉트릭', group: '전기' },
  { code: '009540', name: 'HD한국조선해양', group: '조선' },
  { code: '064350', name: '현대로템', group: '방산' },
  { code: '012450', name: '한화에어로스페이스', group: '방산' },
  { code: '047810', name: '한국항공우주', group: '방산' },
  { code: '272210', name: 'LIG넥스원', group: '방산' },
  { code: '000240', name: '한국타이어앤테크놀로지', group: '자동차부품' },
  { code: '051600', name: '한전KPS', group: '에너지' },
  { code: '018260', name: '삼성에스디에스', group: 'IT' },
] as const;

type StockItem = (typeof STOCK_LIST)[number];

/**
 * 종목 검색 함수
 * - "HD" 입력 시 HD 브랜드(현대그룹) 연관 종목도 함께 검색
 */
function searchStocks(query: string): StockItem[] {
  if (query.length < 2) return [];

  const q = query.toLowerCase();
  const isHdQuery = q === 'hd';

  return STOCK_LIST.filter((stock) => {
    const nameMatch = stock.name.toLowerCase().includes(q);
    const codeMatch = stock.code.toLowerCase().includes(q);
    // HD 입력 시 "현대"가 포함된 종목도 함께 표시 (HD브랜드 = 현대그룹 연관)
    const hdHyundaiMatch = isHdQuery && stock.name.includes('현대');
    return nameMatch || codeMatch || hdHyundaiMatch;
  }).slice(0, 8);
}

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

  /** 자동완성 관련 상태 */
  const [suggestions, setSuggestions] = useState<StockItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  /** 자동완성으로 채워진 경우 true → 종목코드 필드 배경 변경 */
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  /** 자동완성 드롭다운 외부 클릭 감지용 ref */
  const autocompleteRef = useRef<HTMLDivElement>(null);

  /** 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setSuggestions([]);
    setShowSuggestions(false);
    setIsAutoFilled(false);
  };

  /** 종목명 입력 핸들러 */
  const handleStockNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStockName(value);
    setIsAutoFilled(false);

    const results = searchStocks(value);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  /** 자동완성 후보 선택 핸들러 */
  const handleSelectSuggestion = (stock: StockItem) => {
    setStockName(stock.name);
    setStockCode(stock.code);
    setIsAutoFilled(true);
    setSuggestions([]);
    setShowSuggestions(false);
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
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4">주문 입력</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 종목명 (자동완성 드롭다운 포함) */}
        <div ref={autocompleteRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
            종목명
          </label>
          <input
            type="text"
            value={stockName}
            onChange={handleStockNameChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="예: 삼성전자 (2글자 이상 입력 시 자동완성)"
            className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
          {/* 자동완성 드롭다운 */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-lg overflow-hidden">
              {suggestions.map((stock) => (
                <li
                  key={stock.code}
                  onMouseDown={() => handleSelectSuggestion(stock)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-zinc-100">
                      {stock.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-700 rounded px-1">
                      {stock.group}
                    </span>
                  </div>
                  <span className="text-gray-400 dark:text-zinc-500 text-xs font-mono">
                    {stock.code}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 종목코드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
            종목코드
          </label>
          <input
            type="text"
            value={stockCode}
            onChange={(e) => {
              setStockCode(e.target.value);
              setIsAutoFilled(false);
            }}
            placeholder="예: 005930"
            className={`w-full rounded-lg border border-gray-300 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 ${
              isAutoFilled
                ? 'bg-gray-50 dark:bg-zinc-700'
                : 'bg-white dark:bg-zinc-800'
            }`}
          />
        </div>

        {/* 거래 유형 토글 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">거래 유형</label>
          <div className="flex rounded-lg border border-gray-300 dark:border-zinc-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tradeType === 'buy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
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
                  : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
              }`}
            >
              매도
            </button>
          </div>
        </div>

        {/* 수량 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">수량 (주)</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">가격 (원)</label>
          <input
            type="number"
            min={0}
            value={price === 0 ? '' : price}
            onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
            placeholder="원 단위 입력"
            className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* 예상 금액 */}
        {quantity > 0 && price > 0 && (
          <div className="rounded-lg bg-gray-50 dark:bg-zinc-800 px-4 py-3 text-sm">
            <span className="text-gray-600 dark:text-zinc-400">예상 금액: </span>
            <span className="font-bold text-gray-900 dark:text-zinc-100">
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
          <p className="text-xs text-gray-500 dark:text-zinc-400">
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
