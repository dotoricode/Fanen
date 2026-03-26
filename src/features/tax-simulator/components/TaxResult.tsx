'use client';

import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import type { TaxCalcResult } from './TaxForm';

interface TaxResultProps {
  result: TaxCalcResult;
}

/** 숫자를 한국 원화 형식으로 포맷 */
function formatKRW(value: number): string {
  return value.toLocaleString('ko-KR') + '원';
}

/** 세금 시뮬레이션 결과 — DisclaimerBanner variant="tax" 필수 */
export default function TaxResult({ result }: TaxResultProps) {
  const isProfit = result.capitalGain > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-900">계산 결과</h3>

        <dl className="grid gap-3 sm:grid-cols-2">
          {/* 양도차익 */}
          <div className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs text-gray-500">양도차익</dt>
            <dd className={`text-lg font-bold ${isProfit ? 'text-red-600' : 'text-blue-600'}`}>
              {isProfit ? '+' : ''}{formatKRW(result.capitalGain)}
            </dd>
          </div>

          {/* 적용 세율 */}
          <div className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs text-gray-500">
              적용 세율 ({result.isMajorHolder ? '대주주' : '일반'})
            </dt>
            <dd className="text-lg font-bold text-gray-900">{result.taxRate}%</dd>
          </div>

          {/* 예상 세금 */}
          <div className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs text-gray-500">예상 세금</dt>
            <dd className="text-lg font-bold text-orange-600">{formatKRW(result.estimatedTax)}</dd>
          </div>

          {/* 세후 수익 */}
          <div className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs text-gray-500">세후 수익</dt>
            <dd className={`text-lg font-bold ${result.afterTaxProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result.afterTaxProfit >= 0 ? '+' : ''}{formatKRW(result.afterTaxProfit)}
            </dd>
          </div>
        </dl>

        {/* 보유기간 참고 */}
        <p className="mt-3 text-xs text-gray-500">
          보유기간: {result.holdingDays}일 | 수량: {result.quantity.toLocaleString('ko-KR')}주
        </p>
      </div>

      {/* 면책 고지 — tax variant 필수 */}
      <DisclaimerBanner variant="tax" />
    </div>
  );
}
