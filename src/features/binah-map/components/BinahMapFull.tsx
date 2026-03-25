'use client';

/**
 * BinahMapFull — /binah-map 전용 풀사이즈 지도 + 이벤트 목록
 */
import { BinahMapLite } from './BinahMapLite';
import { GeoEventPanel } from './GeoEventPanel';
import { useBinahMap } from '../hooks/useBinahMap';

const EVENT_TYPE_ICON: Record<string, string> = {
  trade:    '🔁',
  conflict: '⚔️',
  policy:   '📋',
  disaster: '🌊',
};

export function BinahMapFull() {
  const { events, selectedEvent, selectEvent } = useBinahMap();

  return (
    <div className="space-y-4">
      {/* 지도 영역 */}
      <div className="rounded-xl border border-slate-200 dark:border-[#1E3448] overflow-hidden">
        <BinahMapLite
          events={events}
          selectedId={selectedEvent?.id}
          onSelect={selectEvent}
          height={320}
        />
      </div>

      {/* 선택 이벤트 패널 */}
      {selectedEvent && (
        <GeoEventPanel event={selectedEvent} onClose={() => selectEvent(null)} />
      )}

      {/* 이벤트 목록 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">현재 모니터링 이벤트 ({events.length}건)</h3>
        {events.map((event) => {
          const isSelected = selectedEvent?.id === event.id;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => selectEvent(event)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                isSelected
                  ? 'border-teal-500 bg-teal-900/20'
                  : 'border-slate-200 bg-white dark:border-[#1E3448] dark:bg-[#162032] hover:border-teal-500 dark:hover:border-teal-700'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">
                  {EVENT_TYPE_ICON[event.eventType] ?? '🌐'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{event.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{event.region}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div
                    className="h-1.5 w-10 rounded-full overflow-hidden bg-slate-200 dark:bg-[#0F1923]"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${event.riskScore}%`,
                        background: event.riskScore >= 70 ? '#F87171' : event.riskScore >= 45 ? '#FBBF24' : '#34D399',
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-500">{event.riskScore}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
