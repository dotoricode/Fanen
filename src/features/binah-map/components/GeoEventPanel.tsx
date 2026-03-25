'use client';

/**
 * GeoEventPanel — 선택된 지정학 이벤트 상세 패널
 */
import Link from 'next/link';
import type { GeoEvent } from '../types';

interface Props {
  event: GeoEvent;
  onClose: () => void;
}

const RISK_LABEL: Record<string, { label: string; color: string }> = {
  high:    { label: '고위험', color: 'text-red-500' },
  medium:  { label: '중위험', color: 'text-amber-500' },
  low:     { label: '저위험', color: 'text-emerald-500' },
};

function riskLevel(score: number) {
  if (score >= 70) return RISK_LABEL.high;
  if (score >= 45) return RISK_LABEL.medium;
  return RISK_LABEL.low;
}

/** affectedSectors 한글명 → value-chain sectorKey 매핑 */
const SECTOR_KEY_MAP: Record<string, string> = {
  방산: 'defense',
  반도체: 'semiconductor',
  '2차전지': 'battery',
  배터리: 'battery',
};

/**
 * affectedSectors 배열에서 value-chain 섹터 키를 추출
 * 매핑 가능한 섹터가 없으면 기본값 "defense" 반환
 */
function resolveSectorKey(affectedSectors: string[]): string {
  for (const s of affectedSectors) {
    const key = SECTOR_KEY_MAP[s];
    if (key) return key;
  }
  return 'defense';
}

const EVENT_TYPE_LABEL: Record<GeoEvent['eventType'], string> = {
  trade:    '무역/기술',
  conflict: '지정학/갈등',
  policy:   '정책/규제',
  disaster: '재해/자연',
};

export function GeoEventPanel({ event, onClose }: Props) {
  const risk = riskLevel(event.riskScore);
  const sectorKey = resolveSectorKey(event.affectedSectors);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 space-y-3">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {EVENT_TYPE_LABEL[event.eventType]} · {event.region}
          </span>
          <h3 className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-50">{event.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors text-lg leading-none"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {/* 위험도 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">위험도</span>
        <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${event.riskScore}%`,
              background: event.riskScore >= 70 ? '#FB7185' : event.riskScore >= 45 ? '#FBBF24' : '#2DD4BF',
            }}
          />
        </div>
        <span className={`text-xs font-semibold ${risk.color}`}>
          {event.riskScore} ({risk.label})
        </span>
      </div>

      {/* 요약 */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{event.summary}</p>

      {/* 수혜 섹터 */}
      <div>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">관련 섹터</span>
        <div className="flex flex-wrap gap-1.5">
          {event.affectedSectors.map((sector) => (
            <span
              key={sector}
              className="rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 text-xs px-2 py-0.5 font-medium"
            >
              {sector}
            </span>
          ))}
        </div>
      </div>

      {/* Value Chain 드릴다운 링크 */}
      <div className="pt-1">
        <Link
          href={`/value-chain?sector=${sectorKey}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 dark:bg-teal-600/20 dark:hover:bg-teal-600/30 dark:border-teal-600/40 px-3 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          Value Chain 보기
        </Link>
      </div>
    </div>
  );
}
