'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BinahMapLite } from '@/features/binah-map';
import { useBinahMap } from '@/features/binah-map';

export function HotZoneCard({ className }: { className?: string }) {
  const { events, selectedEvent, selectEvent } = useBinahMap();
  return (
    <div className={cn(
      'relative rounded-2xl overflow-hidden',
      'border border-slate-100 dark:border-white/5',
      'bg-white dark:bg-white/5 shadow-sm',
      className
    )}>
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-dot-pattern pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          비나 맵 — Hot Zone
        </p>
        <Link href="/binah-map" className="text-xs text-primary hover:underline transition-colors">
          자세히 보기 →
        </Link>
      </div>

      {/* Map */}
      <div className="relative z-10">
        <BinahMapLite
          events={events}
          selectedId={selectedEvent?.id}
          onSelect={selectEvent}
          height={220}
        />
      </div>
    </div>
  );
}
