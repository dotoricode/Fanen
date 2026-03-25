'use client';

import type { PortfolioType } from '../types';

interface PortfolioTypeFilterProps {
  selected: PortfolioType;
  onSelect: (type: PortfolioType) => void;
}

/** 투자 성향별 필터 버튼 목록 */
const PORTFOLIO_TYPES: { type: PortfolioType; icon: string; label: string }[] = [
  { type: 'dividend', icon: '💰', label: '배당형' },
  { type: 'value', icon: '📊', label: '가치형' },
  { type: 'growth', icon: '🚀', label: '성장형' },
  { type: 'theme', icon: '🌐', label: '테마형' },
  { type: 'etf', icon: '🛡️', label: 'ETF안정형' },
];

/** 투자 성향 선택 필터 — 선택된 항목은 teal 강조 */
export default function PortfolioTypeFilter({ selected, onSelect }: PortfolioTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PORTFOLIO_TYPES.map(({ type, icon, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === type
              ? 'bg-teal-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
