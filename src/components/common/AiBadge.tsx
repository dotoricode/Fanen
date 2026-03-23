'use client';

/**
 * AI 분석 뱃지 컴포넌트
 * AI 생성 콘텐츠에만 사용. source prop이 있으면 출처 URL 링크 포함
 *
 * @example
 * <AiBadge label="AI 분석" />
 * <AiBadge label="핀이 분석" source="https://dart.fss.or.kr" variant="warning" />
 */

/** AiBadge Props */
interface AiBadgeProps {
  /** 뱃지에 표시할 라벨 텍스트 */
  label?: string;
  /** variant에 따른 색상 구분 */
  variant?: 'info' | 'warning';
  /** 출처 URL (선택) */
  source?: string;
}

/** variant별 스타일 매핑 */
const VARIANT_STYLES = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-orange-100 text-orange-800',
} as const;

/** AI 분석 뱃지 — AI 생성 콘텐츠 표시용 */
export default function AiBadge({ label = 'AI 분석', variant = 'info', source }: AiBadgeProps) {
  const style = VARIANT_STYLES[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {/* 로봇 아이콘 (인라인 SVG) */}
      <svg
        className="h-3.5 w-3.5"
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
