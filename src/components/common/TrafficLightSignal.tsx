'use client';

/**
 * 매매 신호 신호등 컴포넌트
 * DisclaimerBanner와 함께 사용 필수
 *
 * @example
 * <TrafficLightSignal signal="buy" confidence={75} reason="이동평균선 돌파" />
 * <DisclaimerBanner variant="signal" />
 */

/** 매매 신호 타입 */
type Signal = 'buy' | 'hold' | 'sell';

/** TrafficLightSignal Props */
interface TrafficLightSignalProps {
  /** 매매 신호 */
  signal: Signal;
  /** 신뢰도 (0~100) */
  confidence: number;
  /** AI 분석 근거 텍스트 (선택) */
  reason?: string;
}

/** 신호별 설정 (색상, 라벨, 설명) */
const SIGNAL_CONFIG: Record<Signal, { color: string; bgColor: string; label: string; description: string }> = {
  buy: {
    color: '#1D9E75',
    bgColor: 'bg-green-500',
    label: '매수 신호',
    description: '매수 검토 구간입니다',
  },
  hold: {
    color: '#F5A623',
    bgColor: 'bg-yellow-400',
    label: '관망',
    description: '관망을 권장합니다',
  },
  sell: {
    color: '#E24B4A',
    bgColor: 'bg-red-500',
    label: '매도 신호',
    description: '수익 실현을 고려하세요',
  },
};

/** 매매 신호등 — DisclaimerBanner와 함께 사용 필수 */
export default function TrafficLightSignal({ signal, confidence, reason }: TrafficLightSignalProps) {
  const config = SIGNAL_CONFIG[signal];

  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
      {/* 신호등 원형 아이콘 */}
      <div
        className={`h-10 w-10 flex-shrink-0 rounded-full ${config.bgColor}`}
        style={{ backgroundColor: config.color }}
        aria-hidden="true"
      />
      <div className="flex-1">
        {/* 신호 라벨 */}
        <p className="text-lg font-bold" style={{ color: config.color }}>
          {config.label}
        </p>
        {/* 설명 */}
        <p className="text-sm text-gray-600 dark:text-slate-400">{config.description}</p>
        {/* 신뢰도 */}
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
          신뢰도 {confidence}%
        </p>
        {/* AI 분석 근거 */}
        {reason && (
          <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}
