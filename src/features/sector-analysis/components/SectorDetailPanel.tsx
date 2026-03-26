'use client';

import AiBadge from '@/components/common/AiBadge';
import type { ValueChainNode } from '../types';

const SIGNAL_CONFIG = {
  buy:   { label: '관심', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  wait:  { label: '관망', color: 'text-[#9CA3AF]', bg: 'bg-[#374151]/50' },
  watch: { label: '주의', color: 'text-[#6B7280]', bg: 'bg-[#374151]/30' },
} as const;

const TIER_LABEL: Record<number, string> = {
  0: '중심섹터',
  1: '연관섹터',
  2: '기업',
  3: '공급사',
};

interface SectorDetailPanelProps {
  node: ValueChainNode | null;
  onClose: () => void;
}

/** 섹터 분석 — 종목/섹터 디테일 패널 */
export function SectorDetailPanel({ node, onClose }: SectorDetailPanelProps) {
  if (!node) return null;

  const signal = SIGNAL_CONFIG[node.signal];

  return (
    <div
      className="rounded-xl border border-[#374151] bg-[#1F2937] p-4"
      style={{ transition: 'opacity 0.2s, transform 0.2s' }}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#374151] text-[#9CA3AF]">
            T{node.tier} · {TIER_LABEL[node.tier]}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#4B5563] hover:text-[#9CA3AF] transition-colors text-xs"
          aria-label="패널 닫기"
        >
          ✕
        </button>
      </div>

      {/* 기업명 + 티커 */}
      <div className="mb-3">
        <p className="text-base font-semibold text-[#F9FAFB]">{node.name}</p>
        <p className="text-xs font-mono text-[#9CA3AF] mt-0.5">{node.ticker}</p>
      </div>

      {/* 시그널 + 배당 */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${signal.color} ${signal.bg}`}>
          {signal.label}
        </span>
        {node.dividendYield !== undefined && node.dividendYield > 0 && (
          <span className="text-xs text-[#9CA3AF]">
            배당 {node.dividendYield.toFixed(1)}%
          </span>
        )}
        <span className="text-xs text-[#4B5563]">{node.relationship}</span>
      </div>

      {/* 설명 */}
      <p className="text-xs text-[#6B7280] leading-relaxed mb-3">{node.description}</p>

      {/* AI 뱃지 + 출처 */}
      <AiBadge label="AI 분석" variant="info" source={node.sourceUrl} />
    </div>
  );
}
