import AiBadge from '@/components/common/AiBadge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { ValueChainNode } from '../types';
import { TierBadge } from './TierBadge';

/** 신호 타입별 Badge variant + 레이블 */
const SIGNAL_CONFIG = {
  buy:   { variant: 'success' as const, dot: '🟢', label: '관심' },
  wait:  { variant: 'warning' as const, dot: '🟡', label: '관망' },
  watch: { variant: 'danger'  as const, dot: '🔴', label: '주의' },
} as const;

interface CompanyCardProps {
  node: ValueChainNode;
  isSelected?: boolean;
  onClick?: () => void;
}

/** 밸류체인 종목 카드 컴포넌트 — shadcn/ui 패턴 + 다크모드 지원 */
export function CompanyCard({ node, isSelected = false, onClick }: CompanyCardProps) {
  const signal = SIGNAL_CONFIG[node.signal];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'w-full rounded-xl border p-4 transition-all cursor-pointer text-left',
        'bg-white dark:bg-zinc-900/80',
        'hover:bg-zinc-50 dark:hover:bg-zinc-800',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
        isSelected
          ? 'border-teal-500 dark:border-teal-500 shadow-md shadow-teal-500/10'
          : 'border-slate-200 dark:border-zinc-700'
      )}
    >
      {/* 헤더: 티어 뱃지 + 티커 + 기업명 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <TierBadge tier={node.tier} />
        <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
          {node.ticker}
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          {node.name}
        </span>
      </div>

      {/* 신호 + 배당수익률 */}
      <div className="flex items-center gap-3 mb-3">
        <Badge variant={signal.variant} size="sm">
          <span className="mr-1">{signal.dot}</span>
          {signal.label}
        </Badge>
        {node.dividendYield !== undefined && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            배당 {node.dividendYield.toFixed(1)}%
          </span>
        )}
        <span className="text-xs text-slate-500 dark:text-zinc-500">
          {node.relationship}
        </span>
      </div>

      {/* 반디 설명 */}
      <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed">
        {node.description}
      </p>

      {/* AI 뱃지 + 출처 (CLAUDE.md 원칙) */}
      <div className="flex items-center gap-2 flex-wrap">
        <AiBadge label="AI 분석" variant="info" source={node.sourceUrl} />
      </div>
    </article>
  );
}
