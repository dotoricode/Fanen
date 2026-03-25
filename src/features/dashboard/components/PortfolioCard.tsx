'use client';

/**
 * PortfolioCard — 내 포트폴리오 요약 카드
 */
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MOCK_PORTFOLIO = { totalValue: 12_450_000, totalReturn: 3.2 };

export function PortfolioCard({ className }: { className?: string }) {
  const { totalValue, totalReturn } = MOCK_PORTFOLIO;
  const isPositive = totalReturn >= 0;
  return (
    <div className={cn(
      'rounded-2xl border border-slate-100 dark:border-white/5',
      'bg-white dark:bg-white/5 shadow-sm p-6',
      className
    )}>
      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
        내 포트폴리오
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {totalValue.toLocaleString('ko-KR')}원
      </p>
      <div className="mt-2">
        <Badge
          variant="outline"
          className={cn(
            'text-sm font-semibold',
            isPositive
              ? 'text-red-500 border-red-200 dark:text-red-400 dark:border-red-800'
              : 'text-blue-500 border-blue-200 dark:text-blue-400 dark:border-blue-800'
          )}
        >
          {isPositive ? '+' : ''}{totalReturn}%
        </Badge>
      </div>
      <Link href="/portfolio" className="mt-4 block text-xs text-primary hover:underline transition-colors">
        상세 보기 →
      </Link>
    </div>
  );
}
