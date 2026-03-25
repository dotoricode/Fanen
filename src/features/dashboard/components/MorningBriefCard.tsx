'use client';

/**
 * MorningBriefCard — 반디의 오전 브리핑 카드
 * bandi-aura 배경 + glow ring 디자인
 */
import Link from 'next/link';
import { BandiAvatar } from '@/features/ai-coach/components/BandiAvatar';
import { Badge } from '@/components/ui/badge';
import { MOCK_MORNING_BRIEF } from '@/lib/mock/mockMorningLight';
import { cn } from '@/lib/utils';

const DIRECTION_ICON: Record<string, string> = {
  up:      '▲',
  down:    '▼',
  neutral: '–',
};
const DIRECTION_CLASS: Record<string, string> = {
  up:      'text-red-500 border-red-200 dark:text-red-400 dark:border-red-800',
  down:    'text-blue-500 border-blue-200 dark:text-blue-400 dark:border-blue-800',
  neutral: 'text-slate-500 border-slate-200 dark:text-slate-400 dark:border-slate-600',
};

export function MorningBriefCard({ className }: { className?: string }) {
  const brief = MOCK_MORNING_BRIEF;

  return (
    <div className={cn(
      'rounded-2xl border border-amber-200/40 dark:border-amber-400/10',
      'bg-bandi-aura/30 dark:bg-bandi-aura/15',
      'backdrop-blur-sm p-6 space-y-4',
      className
    )}>
      {/* 반디 + 헤드라인 */}
      <div className="flex items-start gap-3">
        {/* BandiAvatar glow wrapper */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-bandi-glow/40 blur-md animate-pulse" />
          <BandiAvatar size={44} mood={brief.bandiMood} animate />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-teal-400">반디의 오늘 브리핑 ☀️</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
            {brief.headline}
          </p>
        </div>
      </div>

      {/* 요약 */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{brief.summary}</p>

      {/* 섹터 신호: shadcn Badge 사용 */}
      <div className="flex flex-wrap gap-2">
        {brief.topSectors.map((s) => (
          <Badge
            key={s.name}
            variant="outline"
            className={cn('text-xs', DIRECTION_CLASS[s.direction])}
          >
            {DIRECTION_ICON[s.direction]} {s.name}
          </Badge>
        ))}
      </div>

      {/* 비나 맵 링크 */}
      <div className="text-right">
        <Link
          href="/binah-map"
          className="text-xs text-primary hover:underline transition-colors"
        >
          비나 맵에서 전체 보기 →
        </Link>
      </div>
    </div>
  );
}
