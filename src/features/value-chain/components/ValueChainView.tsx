'use client';

/**
 * 수혜 기업 연결망 시각화 컴포넌트 (v1.0.0)
 * 데스크톱: 원형 마인드맵 (Radial Mind Map) — 순수 SVG + Framer Motion
 * 모바일(<768px): 티어별 계층 리스트 (fallback)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';
import { TierBadge } from './TierBadge';
import { CompanyCard } from './CompanyCard';

/* ─────────────────────────────────────────────
   상수: 티어별 스타일
───────────────────────────────────────────── */

/** 티어별 노드 반지름 */
const TIER_RADIUS: Record<number, number> = {
  [-1]: 44, // 중앙 이벤트 노드
  0: 30,
  1: 23,
  2: 18,
  3: 14,
};

/** 티어별 원 레이아웃 반지름 (중앙에서 얼마나 떨어진 궤도) */
const ORBIT_RADIUS: Record<number, number> = {
  0: 120,
  1: 215,
  2: 310,
  3: 400,
};

/** 티어별 테두리/채우기 색상 (라이트/다크 공통 CSS 변수 대신 인라인 처리) */
const TIER_STROKE: Record<number, string> = {
  [-1]: '#0D9488', // teal-600
  0: '#0D9488',    // teal-600
  1: '#0D9488',    // teal-600 (테두리만)
  2: '#F59E0B',    // amber-400
  3: '#F43F5E',    // rose-500
};

const TIER_FILL_DARK: Record<number, string> = {
  [-1]: '#0D9488',
  0: '#18181B',   // zinc-900
  1: '#18181B',
  2: '#18181B',
  3: '#18181B',
};

const TIER_FILL_LIGHT: Record<number, string> = {
  [-1]: '#0D9488',
  0: '#FFFFFF',
  1: '#FFFFFF',
  2: '#FFFFFF',
  3: '#FFFFFF',
};

/** 티어별 연결선 색상 */
const EDGE_STROKE: Record<number, string> = {
  0: '#0D9488',
  1: '#0D9488',
  2: '#F59E0B',
  3: '#F43F5E',
};

/** 모바일 계층 헤더 클래스 */
const TIER_HEADER_CLASS: Record<TierLevel, string> = {
  0: 'bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800',
  1: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-700',
  2: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  3: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
};

/** 티어 레이블 */
const TIER_LABELS: Record<TierLevel, string> = {
  0: '메이저 (T0)',
  1: 'T1 직접납품',
  2: 'T2 부품소재',
  3: 'T3 간접수혜',
};

/* ─────────────────────────────────────────────
   타입 정의
───────────────────────────────────────────── */

interface MindMapNode {
  id: string;
  name: string;
  tier: TierLevel | -1;
  originalNode?: ValueChainNode;
  x: number;
  y: number;
}

interface MindMapEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tier: TierLevel; // 자식 노드의 tier
}

interface TooltipState {
  node: ValueChainNode;
  x: number;
  y: number;
}

interface ValueChainViewProps {
  chain: ValueChain;
}

/* ─────────────────────────────────────────────
   레이아웃 계산
───────────────────────────────────────────── */

/**
 * 원형 마인드맵 좌표 계산
 * - 중앙(0,0) 기준
 * - 각 티어는 해당 궤도 반지름 위에 균등 배치
 * - Tier 1~3는 부모 노드 각도 근처에 서브트리로 묶어 배치
 */
function buildMindMapLayout(chain: ValueChain): {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
} {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // 중앙 이벤트 노드
  const centerNode: MindMapNode = {
    id: '__center__',
    name: chain.sectorLabel,
    tier: -1,
    x: 0,
    y: 0,
  };
  nodes.push(centerNode);

  const t0 = chain.nodes.filter((n) => n.tier === 0);
  const t1 = chain.nodes.filter((n) => n.tier === 1);
  const t2 = chain.nodes.filter((n) => n.tier === 2);
  const t3 = chain.nodes.filter((n) => n.tier === 3);

  // Tier 0 배치 — 중앙 주위 균등 배치
  const t0Angles: number[] = t0.map((_, i) =>
    (2 * Math.PI * i) / t0.length - Math.PI / 2
  );

  const t0Nodes: MindMapNode[] = t0.map((n, i) => ({
    id: n.ticker,
    name: n.name,
    tier: 0,
    originalNode: n,
    x: ORBIT_RADIUS[0] * Math.cos(t0Angles[i]),
    y: ORBIT_RADIUS[0] * Math.sin(t0Angles[i]),
  }));
  nodes.push(...t0Nodes);

  // 중앙 → T0 엣지
  t0Nodes.forEach((n) => {
    edges.push({
      id: `center-${n.id}`,
      x1: 0, y1: 0,
      x2: n.x, y2: n.y,
      tier: 0,
    });
  });

  /**
   * T1, T2, T3 배치 — 각 티어를 T0 노드 수만큼 균등 부채꼴로 나눠 서브트리 배치
   * 각 T0 노드의 각도 중심으로 ±spread 범위 안에 해당 티어 노드들을 배치
   */
  function placeTierNodes(
    tierNodes: ValueChainNode[],
    tier: TierLevel,
    parentTierNodes: MindMapNode[],
    parentTierAngles: number[]
  ): { placed: MindMapNode[]; angles: number[] } {
    if (tierNodes.length === 0) return { placed: [], angles: [] };

    const orbit = ORBIT_RADIUS[tier];
    // 각 부모 노드에 균등 분배
    const perParent = Math.ceil(tierNodes.length / parentTierNodes.length);
    const placed: MindMapNode[] = [];
    const angles: number[] = [];

    tierNodes.forEach((n, i) => {
      const parentIdx = Math.min(
        Math.floor(i / perParent),
        parentTierNodes.length - 1
      );
      const parentAngle = parentTierAngles[parentIdx];
      // 부채꼴 범위: 부모 인덱스 기준 ±(π / T0수)
      const spread = Math.PI / Math.max(parentTierNodes.length, 1);
      // 같은 부모 밑에서의 인덱스
      const siblingIdx = i % perParent;
      const siblingCount = Math.min(
        perParent,
        tierNodes.length - parentIdx * perParent
      );
      const angleStep = siblingCount > 1 ? (2 * spread) / (siblingCount - 1) : 0;
      const angle =
        siblingCount > 1
          ? parentAngle - spread + siblingIdx * angleStep
          : parentAngle;

      placed.push({
        id: n.ticker,
        name: n.name,
        tier: tier,
        originalNode: n,
        x: orbit * Math.cos(angle),
        y: orbit * Math.sin(angle),
      });
      angles.push(angle);
    });

    return { placed, angles };
  }

  const { placed: t1Nodes, angles: t1Angles } = placeTierNodes(
    t1, 1, t0Nodes, t0Angles
  );
  nodes.push(...t1Nodes);

  // T0 → T1 엣지
  t1Nodes.forEach((n, i) => {
    const parentIdx = Math.floor(i / Math.ceil(t1.length / Math.max(t0Nodes.length, 1)));
    const parent = t0Nodes[Math.min(parentIdx, t0Nodes.length - 1)];
    if (parent) {
      edges.push({
        id: `t0-${parent.id}-${n.id}`,
        x1: parent.x, y1: parent.y,
        x2: n.x, y2: n.y,
        tier: 1,
      });
    }
  });

  const { placed: t2Nodes, angles: t2Angles } = placeTierNodes(
    t2, 2,
    t1Nodes.length > 0 ? t1Nodes : t0Nodes,
    t1Nodes.length > 0 ? t1Angles : t0Angles
  );
  nodes.push(...t2Nodes);

  // T1 → T2 엣지
  const t2ParentNodes = t1Nodes.length > 0 ? t1Nodes : t0Nodes;
  t2Nodes.forEach((n, i) => {
    const parentIdx = Math.floor(
      i / Math.ceil(t2.length / Math.max(t2ParentNodes.length, 1))
    );
    const parent = t2ParentNodes[Math.min(parentIdx, t2ParentNodes.length - 1)];
    if (parent) {
      edges.push({
        id: `t1-${parent.id}-${n.id}`,
        x1: parent.x, y1: parent.y,
        x2: n.x, y2: n.y,
        tier: 2,
      });
    }
  });

  const { placed: t3Nodes } = placeTierNodes(
    t3, 3,
    t2Nodes.length > 0 ? t2Nodes : t1Nodes.length > 0 ? t1Nodes : t0Nodes,
    t2Angles.length > 0 ? t2Angles : t1Angles.length > 0 ? t1Angles : t0Angles
  );
  nodes.push(...t3Nodes);

  // T2 → T3 엣지
  const t3ParentNodes =
    t2Nodes.length > 0 ? t2Nodes : t1Nodes.length > 0 ? t1Nodes : t0Nodes;
  t3Nodes.forEach((n, i) => {
    const parentIdx = Math.floor(
      i / Math.ceil(t3.length / Math.max(t3ParentNodes.length, 1))
    );
    const parent = t3ParentNodes[Math.min(parentIdx, t3ParentNodes.length - 1)];
    if (parent) {
      edges.push({
        id: `t2-${parent.id}-${n.id}`,
        x1: parent.x, y1: parent.y,
        x2: n.x, y2: n.y,
        tier: 3,
      });
    }
  });

  return { nodes, edges };
}

/* ─────────────────────────────────────────────
   NodeTooltip 컴포넌트
───────────────────────────────────────────── */

function NodeTooltip({ tooltip }: { tooltip: TooltipState | null }) {
  if (!tooltip) return null;
  const { node, x, y } = tooltip;

  // 툴팁 위치: 노드 우측 상단 (SVG 좌표 → 픽셀은 부모 div 기준)
  const SIGNAL_LABEL: Record<string, string> = {
    buy: '관심', wait: '관망', watch: '주의',
  };
  const SIGNAL_COLOR: Record<string, string> = {
    buy: 'text-teal-600 dark:text-teal-400',
    wait: 'text-amber-600 dark:text-amber-400',
    watch: 'text-rose-500 dark:text-rose-400',
  };

  return (
    <motion.div
      key={node.ticker}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      style={{ left: x, top: y }}
      className="absolute z-50 w-56 pointer-events-none
        bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-700
        rounded-xl shadow-lg p-3 text-left"
    >
      {/* 기업명 + 티어 */}
      <div className="flex items-center gap-2 mb-1.5">
        <TierBadge tier={node.tier} />
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {node.name}
        </span>
      </div>

      {/* 주식 코드 */}
      <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
        {node.ticker}
      </p>

      {/* 역할 */}
      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
        {node.relationship}
        {node.dividendYield !== undefined && node.dividendYield > 0 && (
          <span className="ml-2 text-amber-600 dark:text-amber-400">
            배당 {node.dividendYield.toFixed(1)}%
          </span>
        )}
      </p>

      {/* 설명 */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
        {node.description}
      </p>

      {/* 시그널 */}
      <p className={`text-[11px] font-semibold mt-1.5 ${SIGNAL_COLOR[node.signal]}`}>
        {SIGNAL_LABEL[node.signal]}
      </p>

      {/* 숨은 수혜주 하이라이트 (PRD S2.3) — Tier 2~3 중 주목 */}
      {(node.tier === 2 || node.tier === 3) && (
        <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
          🔦 반디가 발견한 수혜주
        </p>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SVGMindMap — 데스크톱 원형 마인드맵
───────────────────────────────────────────── */

function SVGMindMap({
  chain,
  onNodeClick,
  selectedTicker,
}: {
  chain: ValueChain;
  onNodeClick: (node: ValueChainNode) => void;
  selectedTicker: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(600);
  const [isDark, setIsDark] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerSize(Math.min(w, 700));
    });
    observer.observe(containerRef.current);
    setContainerSize(
      Math.min(containerRef.current.clientWidth || 600, 700)
    );
    return () => observer.disconnect();
  }, []);

  // 다크모드 감지
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const { nodes, edges } = buildMindMapLayout(chain);

  // SVG viewport: 중앙 기준 ± (maxOrbit + 최대노드반지름 + 여백)
  const maxOrbit = ORBIT_RADIUS[3];
  const padding = TIER_RADIUS[0] + 40;
  const viewBoxSize = (maxOrbit + padding) * 2;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;

  const TIER_FILL = isDark ? TIER_FILL_DARK : TIER_FILL_LIGHT;
  const labelColor = isDark ? '#A1A1AA' : '#52525B'; // zinc-400 / zinc-600

  // 마우스 이동 핸들러 — 툴팁 위치 SVG 좌표 → div 픽셀 변환
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGGElement>, node: ValueChainNode) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top - 20;
      setHoveredId(node.ticker);
      setTooltip({ node, x, y });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGGElement>) => {
      if (!containerRef.current || !tooltip) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top - 20;
      setTooltip((prev) => (prev ? { ...prev, x, y } : prev));
    },
    [tooltip]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height: containerSize }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={containerSize}
        height={containerSize}
        className="w-full h-full overflow-visible"
        aria-label="수혜 기업 연결망 마인드맵"
      >
        {/* ── 엣지 (연결선) ── */}
        <g>
          {edges.map((edge, idx) => (
            <motion.line
              key={edge.id}
              x1={cx + edge.x1}
              y1={cy + edge.y1}
              x2={cx + edge.x2}
              y2={cy + edge.y2}
              stroke={EDGE_STROKE[edge.tier]}
              strokeWidth={edge.tier === 0 ? 2 : 1.5}
              strokeOpacity={
                hoveredId
                  ? // hover 시: 관련 엣지만 강조, 나머지 흐리게
                    edge.id.includes(hoveredId)
                    ? 0.9
                    : 0.08
                  : 0.28
              }
              strokeDasharray={edge.tier === 3 ? '4 3' : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 0.6, delay: edge.tier * 0.2 },
                opacity: { duration: 0.3, delay: edge.tier * 0.2 },
              }}
              style={{ transition: 'stroke-opacity 0.2s' }}
            />
          ))}
        </g>

        {/* ── 노드 ── */}
        <g>
          {nodes.map((node, idx) => {
            const r = TIER_RADIUS[node.tier as number] ?? 14;
            const isCenter = node.tier === -1;
            const isSelected =
              node.originalNode?.ticker === selectedTicker;
            const isHovered = hoveredId === node.id;
            const fill = isCenter
              ? TIER_FILL[-1]
              : TIER_FILL[node.tier as number] ?? TIER_FILL[0];
            const stroke = isSelected
              ? '#F59E0B' // amber-400 강조
              : TIER_STROKE[node.tier as number] ?? TIER_STROKE[0];
            const strokeWidth = isSelected ? 3 : isCenter ? 0 : 1.5;
            // Tier 3는 점선 테두리 ("숨은 수혜주")
            const strokeDash = node.tier === 3 ? '4 2' : undefined;

            // 노드 등장 순서: tier 기준 stagger
            const tierDelay =
              isCenter
                ? 0
                : (node.tier as number) * 0.25 + idx * 0.04;

            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isHovered ? 1.12 : 1,
                  opacity: 1,
                }}
                transition={{
                  scale: { duration: 0.18 },
                  opacity: { duration: 0.3, delay: tierDelay },
                  default: { duration: 0.35, delay: tierDelay },
                }}
                style={{
                  originX: `${cx + node.x}px`,
                  originY: `${cy + node.y}px`,
                  cursor: node.originalNode ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (node.originalNode) onNodeClick(node.originalNode);
                }}
                onMouseEnter={
                  node.originalNode
                    ? (e) =>
                        handleMouseEnter(
                          e as React.MouseEvent<SVGGElement>,
                          node.originalNode!
                        )
                    : undefined
                }
                onMouseMove={
                  node.originalNode
                    ? (e) =>
                        handleMouseMove(
                          e as React.MouseEvent<SVGGElement>
                        )
                    : undefined
                }
                onMouseLeave={node.originalNode ? handleMouseLeave : undefined}
              >
                {/* 노드 원 */}
                <circle
                  cx={cx + node.x}
                  cy={cy + node.y}
                  r={r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                />

                {/* 중앙 노드: 섹터 텍스트 */}
                {isCenter && (
                  <text
                    x={cx + node.x}
                    y={cy + node.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#FFFFFF"
                    fontSize={13}
                    fontWeight="700"
                    letterSpacing="-0.3"
                  >
                    {node.name}
                  </text>
                )}

                {/* 일반 노드: 기업명 레이블 (외부) */}
                {!isCenter && (
                  <text
                    x={cx + node.x}
                    y={cy + node.y + r + 11}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={labelColor}
                    fontSize={9}
                    fontWeight={isSelected ? '700' : '500'}
                  >
                    {node.name.length > 7
                      ? node.name.slice(0, 6) + '…'
                      : node.name}
                  </text>
                )}

                {/* 선택된 노드 강조 링 */}
                {isSelected && !isCenter && (
                  <circle
                    cx={cx + node.x}
                    cy={cy + node.y}
                    r={r + 5}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    strokeDasharray="4 2"
                  />
                )}

                {/* 숨은 수혜주 아이콘 (Tier 2~3) */}
                {(node.tier === 2 || node.tier === 3) &&
                  node.originalNode && (
                    <text
                      x={cx + node.x + r - 2}
                      y={cy + node.y - r + 2}
                      fontSize={8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      🔦
                    </text>
                  )}
              </motion.g>
            );
          })}
        </g>

        {/* 이벤트 트리거 텍스트 — 중앙 하단 */}
        <text
          x={cx}
          y={cy + TIER_RADIUS[-1] + 18}
          textAnchor="middle"
          fill={isDark ? '#6B7280' : '#9CA3AF'}
          fontSize={9}
          fontStyle="italic"
        >
          {chain.eventTrigger.length > 30
            ? chain.eventTrigger.slice(0, 28) + '…'
            : chain.eventTrigger}
        </text>
      </svg>

      {/* NodeTooltip — SVG 위 절대 위치 */}
      <AnimatePresence>
        {tooltip && <NodeTooltip tooltip={tooltip} />}
      </AnimatePresence>

      {/* 범례 */}
      <div className="absolute bottom-2 right-3 flex flex-col gap-1 pointer-events-none">
        {[
          { label: 'T0 메이저',   color: TIER_STROKE[0], dash: false },
          { label: 'T1 직접납품', color: TIER_STROKE[1], dash: false },
          { label: 'T2 부품소재', color: TIER_STROKE[2], dash: false },
          { label: 'T3 간접수혜 (🔦 숨은 수혜주)', color: TIER_STROKE[3], dash: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <svg width={20} height={2} className="flex-shrink-0">
              <line
                x1={0} y1={1} x2={20} y2={1}
                stroke={item.color}
                strokeWidth={2}
                strokeDasharray={item.dash ? '3 2' : undefined}
              />
            </svg>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TierList — 모바일 계층 리스트 fallback
───────────────────────────────────────────── */

function TierList({
  chain,
  selectedNode,
  onNodeClick,
}: {
  chain: ValueChain;
  selectedNode: ValueChainNode | null;
  onNodeClick: (node: ValueChainNode) => void;
}) {
  const tiers = ([0, 1, 2, 3] as TierLevel[]).map((tier) => ({
    tier,
    nodes: chain.nodes.filter((n) => n.tier === tier),
  }));

  return (
    <div className="space-y-3">
      {tiers.map(({ tier, nodes }, idx) => (
        <div key={tier}>
          {idx > 0 && (
            <div className="flex justify-center py-1 text-zinc-400 dark:text-zinc-600 text-lg">
              ↓
            </div>
          )}
          <div
            className={`rounded-t-lg border-x border-t px-3 py-2 ${TIER_HEADER_CLASS[tier]}`}
          >
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {TIER_LABELS[tier]}
            </span>
            <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-500">
              ({nodes.length}개)
            </span>
          </div>
          <div className="border-x border-b border-zinc-200 dark:border-zinc-700 rounded-b-lg space-y-1 p-2">
            {nodes.map((node) => (
              <button
                key={node.ticker}
                type="button"
                onClick={() => onNodeClick(node)}
                className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors
                  hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                    selectedNode?.ticker === node.ticker
                      ? 'bg-zinc-100 dark:bg-zinc-800 ring-1 ring-teal-500'
                      : 'bg-white/50 dark:bg-zinc-900/50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <TierBadge tier={node.tier} />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                    {node.name}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                    {node.ticker}
                  </span>
                  {/* 숨은 수혜주 표시 */}
                  {(node.tier === 2 || node.tier === 3) && (
                    <span className="ml-auto text-[10px] text-teal-600 dark:text-teal-400">
                      🔦 반디 수혜주
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   메인 ValueChainView 컴포넌트
───────────────────────────────────────────── */

/** 수혜 기업 연결망 메인 뷰 */
export function ValueChainView({ chain }: ValueChainViewProps) {
  const [selectedNode, setSelectedNode] = useState<ValueChainNode | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNodeClick = (node: ValueChainNode) => {
    setSelectedNode((prev) =>
      prev?.ticker === node.ticker ? null : node
    );
  };

  return (
    <div className="space-y-4">
      {/* 이벤트 트리거 배너 */}
      <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-700/50 dark:bg-teal-900/20">
        <p className="text-sm text-teal-700 dark:text-teal-300">
          <span className="font-semibold mr-2">트리거:</span>
          {chain.eventTrigger}
        </p>
      </div>

      {/* 데스크톱: 원형 마인드맵 / 모바일: 계층 리스트 */}
      {isMobile ? (
        <TierList
          chain={chain}
          selectedNode={selectedNode}
          onNodeClick={handleNodeClick}
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950 p-4 overflow-hidden">
          <SVGMindMap
            chain={chain}
            onNodeClick={handleNodeClick}
            selectedTicker={selectedNode?.ticker ?? null}
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2 text-center">
            노드를 클릭하거나 마우스를 올리면 종목 상세 정보를 볼 수 있습니다
          </p>
        </div>
      )}

      {/* 선택 노드 상세 카드 */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            key={selectedNode.ticker}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                종목 상세
              </h3>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                닫기 ✕
              </button>
            </div>
            <CompanyCard
              node={selectedNode}
              isSelected
              onClick={() => setSelectedNode(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-zinc-400 dark:text-zinc-600 text-right">
        마지막 업데이트: {new Date(chain.updatedAt).toLocaleString('ko-KR')}
      </p>
    </div>
  );
}
