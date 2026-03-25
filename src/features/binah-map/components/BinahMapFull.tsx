'use client';

/**
 * BinahMapFull — /binah-map 전용 풀사이즈 지도 + 이벤트 목록
 * - 시맨틱 컬러로 라이트/다크 모드 완벽 지원
 * - hoveredId: 리스트 호버 ↔ 지도 마커 강조 연동
 * - Bento 개별 카드 레이아웃
 */
import { useState } from 'react';
import { BinahMapLite } from './BinahMapLite';
import { GeoEventPanel } from './GeoEventPanel';
import { useBinahMap } from '../hooks/useBinahMap';

const EVENT_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  trade:    { label: 'TRADE',    color: 'text-teal-600 dark:text-teal-400' },
  conflict: { label: 'CONFLICT', color: 'text-rose-600 dark:text-rose-400' },
  policy:   { label: 'POLICY',   color: 'text-amber-600 dark:text-amber-400' },
  disaster: { label: 'DISASTER', color: 'text-rose-700 dark:text-rose-500' },
};

function riskBarColor(score: number) {
  if (score >= 70) return '#FB7185';
  if (score >= 45) return '#FBBF24';
  return '#2DD4BF';
}

export function BinahMapFull() {
  const { events, selectedEvent, selectEvent } = useBinahMap();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* 지도 영역 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <BinahMapLite
          events={events}
          selectedId={selectedEvent?.id}
          hoveredId={hoveredId}
          onSelect={selectEvent}
          height={320}
        />
      </div>

      {/* 선택 이벤트 상세 패널 */}
      {selectedEvent && (
        <GeoEventPanel event={selectedEvent} onClose={() => selectEvent(null)} />
      )}

      {/* 이벤트 목록 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          모니터링 이벤트 <span className="text-zinc-400 dark:text-zinc-600">({events.length})</span>
        </h3>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
          클릭 → Value Chain 분석
        </span>
      </div>

      {/* Bento 개별 카드 */}
      <div className="space-y-2">
        {events.map((event) => {
          const isSelected = selectedEvent?.id === event.id;
          const isHovered = hoveredId === event.id;
          const typeStyle = EVENT_TYPE_LABEL[event.eventType] ?? { label: 'EVENT', color: 'text-zinc-500 dark:text-zinc-400' };

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => selectEvent(event)}
              onMouseEnter={() => setHoveredId(event.id)}
              onMouseLeave={() => setHoveredId(null)}
              title="클릭하여 Value Chain 분석하기"
              className={[
                'group w-full text-left rounded-xl border p-3.5 cursor-pointer',
                'transition-all duration-200',
                isSelected
                  ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 shadow-sm'
                  : isHovered
                  ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60 shadow-sm -translate-y-px'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:shadow-sm',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                {/* 타입 뱃지 */}
                <span className={`text-[9px] font-bold tracking-widest mt-0.5 w-16 shrink-0 ${typeStyle.color}`}>
                  {typeStyle.label}
                </span>

                {/* 제목 + 지역 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate leading-snug">
                    {event.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 tracking-wide">
                    {event.region}
                  </p>
                  {/* 요약 — hover시 부드럽게 출현 */}
                  <p className={`text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed line-clamp-1 transition-all duration-200 ${isHovered || isSelected ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    {event.summary}
                  </p>
                </div>

                {/* 위험도 + CTA */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${event.riskScore}%`,
                          background: riskBarColor(event.riskScore),
                        }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400 w-5 text-right">
                      {event.riskScore}
                    </span>
                  </div>
                  {/* 호버 시 CTA 힌트 */}
                  <span className={`text-[9px] text-teal-600 dark:text-teal-400 font-medium transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    분석 보기 →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
