'use client';

/**
 * 투자 성향 필터 탭 컴포넌트 (PRD S3.2)
 * 전체 / 배당형 / 가치형 / 성장형 / 테마형 / ETF안정형
 */
import type { InvestmentStyleType } from '../types';
import { INVESTMENT_STYLE_CONFIG } from '@/lib/mock/mockPortfolio';

/** 필터 탭 전체 포함 옵션 */
type StyleFilterOption = InvestmentStyleType | 'all';

interface PortfolioStyleFilterProps {
  selected: StyleFilterOption;
  onSelect: (type: StyleFilterOption) => void;
  /** 각 성향별 포트폴리오 개수 */
  counts: Record<InvestmentStyleType | 'all', number>;
}

export default function PortfolioStyleFilter({
  selected,
  onSelect,
  counts,
}: PortfolioStyleFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 탭 */}
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === 'all'
            ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        전체
        {counts.all > 0 && (
          <span className={`text-[10px] px-1 py-0.5 rounded-full ${
            selected === 'all'
              ? 'bg-white/20 text-white dark:bg-zinc-900/30 dark:text-zinc-200'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
          }`}>
            {counts.all}
          </span>
        )}
      </button>

      {/* 성향별 탭 */}
      {INVESTMENT_STYLE_CONFIG.map(({ type, label, colorBg, colorText, colorBorder }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selected === type
              ? `${colorBg} ${colorText} ${colorBorder}`
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {label}
          {counts[type] > 0 && (
            <span className={`text-[10px] px-1 py-0.5 rounded-full ${
              selected === type
                ? `${colorBg} ${colorText}`
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}>
              {counts[type]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export type { StyleFilterOption };
