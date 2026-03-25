'use client';

/**
 * AI 분석 뱃지 컴포넌트
 * - variant="info"    : 기본 파란 뱃지
 * - variant="warning" : 경고 주황 뱃지
 * - variant="live"    : outline + 실시간 핑 도트 (AI 동작 중 표시)
 *
 * @example
 * <AiBadge label="반디 분석" variant="live" />
 * <AiBadge label="AI 분석" source="https://dart.fss.or.kr" />
 */

interface AiBadgeProps {
  label?: string;
  variant?: 'info' | 'warning' | 'live';
  source?: string;
}

const VARIANT_STYLES = {
  info:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-transparent',
  warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-transparent',
  live:    'bg-transparent text-foreground border-border hover:bg-muted/50 transition-colors',
} as const;

export default function AiBadge({ label = 'AI 분석', variant = 'info', source }: AiBadgeProps) {
  const style = VARIANT_STYLES[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {/* live variant: 맥박 핑 도트 */}
      {variant === 'live' ? (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 ai-badge-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
        </span>
      ) : (
        /* 로봇 아이콘 */
        <svg
          className="h-3 w-3 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      )}

      <span>{label}</span>

      {source && (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          aria-label={`출처: ${source}`}
        >
          출처
        </a>
      )}
    </span>
  );
}
