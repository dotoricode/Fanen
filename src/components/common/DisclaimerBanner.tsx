'use client';

/**
 * 면책 고지 배너 컴포넌트
 * 모든 분석 화면에 필수 사용
 *
 * @example
 * <DisclaimerBanner variant="default" />
 * <DisclaimerBanner variant="signal" />
 */

/** 면책 고지 variant별 문구 매핑 */
const DISCLAIMER_MESSAGES: Record<DisclaimerVariant, string> = {
  default: '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다',
  pack: '본 팩은 투자 권유가 아닌 정보 제공 서비스입니다. 투자 판단은 본인에게 있습니다.',
  tax: '현행 세법(2026년 기준)이며 세법 변경 시 달라질 수 있습니다. 세무 전문가 확인을 권장합니다.',
  signal: '본 시그널은 AI 분석 결과이며 투자 판단의 근거가 아닙니다. 투자 책임은 본인에게 있습니다.',
};

/** variant 타입 */
type DisclaimerVariant = 'default' | 'pack' | 'tax' | 'signal';

/** DisclaimerBanner Props */
interface DisclaimerBannerProps {
  /** 면책 고지 문구 유형 */
  variant?: DisclaimerVariant;
}

/** 면책 고지 배너 — 분석 결과 표시 화면에 필수 렌더링 */
export default function DisclaimerBanner({ variant = 'default' }: DisclaimerBannerProps) {
  const message = DISCLAIMER_MESSAGES[variant];

  return (
    <div
      className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
      role="alert"
    >
      <p className="flex items-center gap-2">
        <span className="font-semibold">안내</span>
        <span>{message}</span>
      </p>
    </div>
  );
}
