'use client';

/**
 * SectorTop3Card — 오늘 반디가 주목한 섹터 Top3
 * shadcn Progress + Badge 기반 디자인
 */
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MOCK_GEO_EVENTS } from '@/lib/mock/mockBinahMap';
import { cn } from '@/lib/utils';

/** 이벤트에서 섹터별 최고 riskScore 집계 */
function deriveTopSectors() {
  const scoreMap = new Map<string, number>();
  for (const ev of MOCK_GEO_EVENTS) {
    for (const sector of ev.affectedSectors) {
      const prev = scoreMap.get(sector) ?? 0;
      if (ev.riskScore > prev) scoreMap.set(sector, ev.riskScore);
    }
  }
  return [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, score]) => ({ name, score }));
}

const TOP_SECTORS = deriveTopSectors();

export function SectorTop3Card({ className }: { className?: string }) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-100 dark:border-white/5',
      'bg-white dark:bg-white/5 shadow-sm p-6 space-y-3',
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          오늘 반디 주목 섹터
        </p>
        <Link href="/binah-map" className="text-xs text-primary hover:underline transition-colors">
          지도 보기 →
        </Link>
      </div>

      <div className="space-y-3">
        {TOP_SECTORS.map((s, idx) => (
          <div key={s.name} className="flex items-center gap-3">
            {/* 순위 Badge — 원형 */}
            <Badge
              variant="outline"
              className="w-5 h-5 rounded-full flex items-center justify-center p-0 text-[10px] font-bold"
            >
              {idx + 1}
            </Badge>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {s.score}
                </span>
              </div>
              {/* teal primary 단색 Progress */}
              <Progress value={s.score} className="h-1.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
