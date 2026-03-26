'use client';

/**
 * 섹터 분석 방사형 마인드맵 컴포넌트
 * - 모노크롬 다크 팔레트 (TradingView 톤)
 * - D3 zoom/pan (pinch 지원)
 * - 모바일도 방사형 유지
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';

/* ─────────────────────────────────────────────
   색상 팔레트 (고정 — 모노크롬 + 단일 accent)
───────────────────────────────────────────── */

const PALETTE = {
  centerFill: '#F9FAFB',
  centerText: '#111111',
  nodeFillDark: '#1F2937',
  nodeFillLight: '#F9FAFB',
  nodeStroke: {
    '-1': '#E5E7EB',
    '0': '#3B82F6',   // accent — 중심섹터
    '1': '#9CA3AF',   // 연관섹터
    '2': '#374151',   // 기업
    '3': '#374151',   // 공급사
  } as Record<string, string>,
  edge: '#374151',
  edgeOpacity: 0.35,
  hover: '#3B82F6',
  hoverEdge: '#3B82F6',
  label: '#9CA3AF',
  labelSelected: '#E5E7EB',
} as const;

/* ─────────────────────────────────────────────
   레이아웃 상수
───────────────────────────────────────────── */

const TIER_RADIUS: Record<number, number> = {
  [-1]: 44, // 중앙 섹터 노드
  0: 28,
  1: 22,
  2: 17,
  3: 13,
};

const ORBIT_RADIUS: Record<number, number> = {
  0: 120,
  1: 215,
  2: 310,
  3: 400,
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
  tier: TierLevel;
}

interface TooltipState {
  node: ValueChainNode;
  x: number;
  y: number;
}

/* ─────────────────────────────────────────────
   레이아웃 계산 (기존 로직 유지)
───────────────────────────────────────────── */

function buildMindMapLayout(chain: ValueChain): {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
} {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // 중앙 섹터 노드
  nodes.push({ id: '__center__', name: chain.sectorLabel, tier: -1, x: 0, y: 0 });

  const t0 = chain.nodes.filter((n) => n.tier === 0);
  const t1 = chain.nodes.filter((n) => n.tier === 1);
  const t2 = chain.nodes.filter((n) => n.tier === 2);
  const t3 = chain.nodes.filter((n) => n.tier === 3);

  const t0Angles = t0.map((_, i) => (2 * Math.PI * i) / t0.length - Math.PI / 2);
  const t0Nodes: MindMapNode[] = t0.map((n, i) => ({
    id: n.ticker, name: n.name, tier: 0, originalNode: n,
    x: ORBIT_RADIUS[0] * Math.cos(t0Angles[i]),
    y: ORBIT_RADIUS[0] * Math.sin(t0Angles[i]),
  }));
  nodes.push(...t0Nodes);
  t0Nodes.forEach((n) => edges.push({ id: `center-${n.id}`, x1: 0, y1: 0, x2: n.x, y2: n.y, tier: 0 }));

  function placeTierNodes(
    tierNodes: ValueChainNode[],
    tier: TierLevel,
    parentTierNodes: MindMapNode[],
    parentTierAngles: number[]
  ): { placed: MindMapNode[]; angles: number[] } {
    if (tierNodes.length === 0) return { placed: [], angles: [] };
    const orbit = ORBIT_RADIUS[tier];
    const perParent = Math.ceil(tierNodes.length / parentTierNodes.length);
    const placed: MindMapNode[] = [];
    const angles: number[] = [];
    tierNodes.forEach((n, i) => {
      const parentIdx = Math.min(Math.floor(i / perParent), parentTierNodes.length - 1);
      const parentAngle = parentTierAngles[parentIdx];
      const spread = Math.PI / Math.max(parentTierNodes.length, 1);
      const siblingIdx = i % perParent;
      const siblingCount = Math.min(perParent, tierNodes.length - parentIdx * perParent);
      const angleStep = siblingCount > 1 ? (2 * spread) / (siblingCount - 1) : 0;
      const angle = siblingCount > 1 ? parentAngle - spread + siblingIdx * angleStep : parentAngle;
      placed.push({ id: n.ticker, name: n.name, tier, originalNode: n,
        x: orbit * Math.cos(angle), y: orbit * Math.sin(angle) });
      angles.push(angle);
    });
    return { placed, angles };
  }

  const { placed: t1Nodes, angles: t1Angles } = placeTierNodes(t1, 1, t0Nodes, t0Angles);
  nodes.push(...t1Nodes);
  t1Nodes.forEach((n, i) => {
    const parentIdx = Math.min(Math.floor(i / Math.ceil(t1.length / Math.max(t0Nodes.length, 1))), t0Nodes.length - 1);
    const parent = t0Nodes[parentIdx];
    if (parent) edges.push({ id: `t0-${parent.id}-${n.id}`, x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, tier: 1 });
  });

  const { placed: t2Nodes, angles: t2Angles } = placeTierNodes(t2, 2,
    t1Nodes.length > 0 ? t1Nodes : t0Nodes,
    t1Nodes.length > 0 ? t1Angles : t0Angles);
  nodes.push(...t2Nodes);
  const t2ParentNodes = t1Nodes.length > 0 ? t1Nodes : t0Nodes;
  t2Nodes.forEach((n, i) => {
    const parentIdx = Math.min(Math.floor(i / Math.ceil(t2.length / Math.max(t2ParentNodes.length, 1))), t2ParentNodes.length - 1);
    const parent = t2ParentNodes[parentIdx];
    if (parent) edges.push({ id: `t1-${parent.id}-${n.id}`, x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, tier: 2 });
  });

  const { placed: t3Nodes } = placeTierNodes(t3, 3,
    t2Nodes.length > 0 ? t2Nodes : t1Nodes.length > 0 ? t1Nodes : t0Nodes,
    t2Angles.length > 0 ? t2Angles : t1Angles.length > 0 ? t1Angles : t0Angles);
  nodes.push(...t3Nodes);
  const t3ParentNodes = t2Nodes.length > 0 ? t2Nodes : t1Nodes.length > 0 ? t1Nodes : t0Nodes;
  t3Nodes.forEach((n, i) => {
    const parentIdx = Math.min(Math.floor(i / Math.ceil(t3.length / Math.max(t3ParentNodes.length, 1))), t3ParentNodes.length - 1);
    const parent = t3ParentNodes[parentIdx];
    if (parent) edges.push({ id: `t2-${parent.id}-${n.id}`, x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, tier: 3 });
  });

  return { nodes, edges };
}

/* ─────────────────────────────────────────────
   NodeTooltip
───────────────────────────────────────────── */

const SIGNAL_LABEL: Record<string, string> = { buy: '관심', wait: '관망', watch: '주의' };
const SIGNAL_COLOR: Record<string, string> = {
  buy: 'text-blue-400',
  wait: 'text-zinc-400',
  watch: 'text-zinc-500',
};

function NodeTooltip({ tooltip }: { tooltip: TooltipState | null }) {
  if (!tooltip) return null;
  const { node, x, y } = tooltip;
  return (
    <div
      style={{ left: x, top: y, transition: 'opacity 0.15s' }}
      className="absolute z-50 w-56 pointer-events-none
        bg-[#1F2937] border border-[#374151]
        rounded-xl shadow-xl p-3 text-left opacity-100"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#374151] text-[#9CA3AF]">
          T{node.tier}
        </span>
        <span className="text-xs font-semibold text-[#F9FAFB]">{node.name}</span>
      </div>
      <p className="text-[10px] font-mono text-[#9CA3AF] mb-1">{node.ticker}</p>
      <p className="text-[11px] text-[#9CA3AF] mb-1">
        {node.relationship}
        {node.dividendYield !== undefined && node.dividendYield > 0 && (
          <span className="ml-2 text-[#9CA3AF]">배당 {node.dividendYield.toFixed(1)}%</span>
        )}
      </p>
      <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-3">{node.description}</p>
      <p className={`text-[11px] font-semibold mt-1.5 ${SIGNAL_COLOR[node.signal]}`}>
        {SIGNAL_LABEL[node.signal]}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   메인 SectorMindmapView
───────────────────────────────────────────── */

interface SectorMindmapViewProps {
  chain: ValueChain;
  onNodeClick?: (node: ValueChainNode) => void;
  selectedTicker?: string | null;
}

export function SectorMindmapView({ chain, onNodeClick, selectedTicker }: SectorMindmapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  const [containerSize, setContainerSize] = useState(600);
  const [isDark, setIsDark] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerSize(Math.min(w, 720));
    });
    observer.observe(containerRef.current);
    setContainerSize(Math.min(containerRef.current.clientWidth || 600, 720));
    return () => observer.disconnect();
  }, []);

  // 다크모드 감지
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // d3.zoom 등록
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on('zoom', (event) => {
        if (gRef.current) {
          gRef.current.setAttribute('transform', event.transform.toString());
        }
      });
    const svgSelection = d3.select(svgRef.current);
    svgSelection.call(zoom);
    // 초기 transform: 화면 중앙 (viewBox 중앙)
    return () => { svgSelection.on('.zoom', null); };
  }, [containerSize]);

  const { nodes, edges } = buildMindMapLayout(chain);
  const maxOrbit = ORBIT_RADIUS[3];
  const padding = TIER_RADIUS[0] + 40;
  const viewBoxSize = (maxOrbit + padding) * 2;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;

  const nodeFill = (tier: number) => {
    if (tier === -1) return PALETTE.centerFill;
    return isDark ? PALETTE.nodeFillDark : PALETTE.nodeFillLight;
  };

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGGElement>, node: ValueChainNode) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setHoveredId(node.ticker);
      setTooltip({ node, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 20 });
    }, []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGGElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltip((prev) => prev ? { ...prev, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 20 } : prev);
    }, []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-xl
        bg-[#111111] border border-[#374151]"
      style={{ height: containerSize }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={containerSize}
        height={containerSize}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="섹터 분석 방사형 마인드맵"
      >
        <g ref={gRef}>
          {/* ── 엣지 (연결선) ── */}
          <g>
            {edges.map((edge) => (
              <line
                key={edge.id}
                x1={cx + edge.x1} y1={cy + edge.y1}
                x2={cx + edge.x2} y2={cy + edge.y2}
                stroke={hoveredId && edge.id.includes(hoveredId) ? PALETTE.hoverEdge : PALETTE.edge}
                strokeWidth={edge.tier === 0 ? 1.5 : 1}
                strokeOpacity={
                  hoveredId
                    ? edge.id.includes(hoveredId) ? 0.9 : 0.06
                    : PALETTE.edgeOpacity
                }
                strokeDasharray={edge.tier === 3 ? '4 3' : undefined}
                style={{ transition: 'stroke-opacity 0.2s, stroke 0.2s' }}
              />
            ))}
          </g>

          {/* ── 노드 ── */}
          <g>
            {nodes.map((node) => {
              const r = TIER_RADIUS[node.tier as number] ?? 13;
              const isCenter = node.tier === -1;
              const isSelected = node.originalNode?.ticker === selectedTicker;
              const isHovered = hoveredId === node.id;
              const fill = nodeFill(node.tier as number);
              const strokeKey = String(node.tier);
              const stroke = isSelected || isHovered
                ? PALETTE.hover
                : PALETTE.nodeStroke[strokeKey] ?? PALETTE.nodeStroke['2'];
              const strokeWidth = isSelected ? 2.5 : isCenter ? 0 : 1.5;

              return (
                <g
                  key={node.id}
                  style={{
                    cursor: node.originalNode ? 'pointer' : 'default',
                    transition: 'opacity 0.2s',
                    opacity: hoveredId && !isCenter && hoveredId !== node.id ? 0.4 : 1,
                    transform: isHovered ? `translate(${cx + node.x}px, ${cy + node.y}px) scale(1.15) translate(${-(cx + node.x)}px, ${-(cy + node.y)}px)` : undefined,
                  }}
                  onClick={() => node.originalNode && onNodeClick?.(node.originalNode)}
                  onMouseEnter={node.originalNode ? (e) => handleMouseEnter(e as React.MouseEvent<SVGGElement>, node.originalNode!) : undefined}
                  onMouseMove={node.originalNode ? (e) => handleMouseMove(e as React.MouseEvent<SVGGElement>) : undefined}
                  onMouseLeave={node.originalNode ? handleMouseLeave : undefined}
                  aria-label={node.name}
                >
                  {/* 노드 원 */}
                  <circle
                    cx={cx + node.x} cy={cy + node.y} r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={node.tier === 3 ? '4 2' : undefined}
                  />

                  {/* 중앙 노드 텍스트 */}
                  {isCenter && (
                    <text
                      x={cx + node.x} y={cy + node.y + 1}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={PALETTE.centerText} fontSize={13} fontWeight="700" letterSpacing="-0.3"
                    >
                      {node.name}
                    </text>
                  )}

                  {/* 일반 노드 레이블 */}
                  {!isCenter && (
                    <text
                      x={cx + node.x} y={cy + node.y + r + 11}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={isSelected || isHovered ? PALETTE.labelSelected : PALETTE.label}
                      fontSize={9}
                      fontWeight={isSelected ? '700' : '400'}
                      style={{ transition: 'fill 0.2s' }}
                    >
                      {node.name.length > 7 ? node.name.slice(0, 6) + '…' : node.name}
                    </text>
                  )}

                  {/* 선택 강조 링 */}
                  {isSelected && !isCenter && (
                    <circle
                      cx={cx + node.x} cy={cy + node.y} r={r + 6}
                      fill="none"
                      stroke={PALETTE.hover} strokeWidth={1} strokeOpacity={0.4}
                      strokeDasharray="4 2"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* 이벤트 트리거 텍스트 — 중앙 하단 */}
          <text
            x={cx} y={cy + TIER_RADIUS[-1] + 18}
            textAnchor="middle"
            fill="#4B5563"
            fontSize={9} fontStyle="italic"
          >
            {chain.eventTrigger.length > 32 ? chain.eventTrigger.slice(0, 30) + '…' : chain.eventTrigger}
          </text>
        </g>
      </svg>

      {/* 툴팁 */}
      {tooltip && <NodeTooltip tooltip={tooltip} />}

      {/* 범례 */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 pointer-events-none">
        {[
          { label: '중심섹터', color: PALETTE.nodeStroke['0'], dash: false },
          { label: '연관섹터', color: PALETTE.nodeStroke['1'], dash: false },
          { label: '기업',     color: PALETTE.nodeStroke['2'], dash: false },
          { label: '공급사',   color: PALETTE.nodeStroke['3'], dash: true  },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <svg width={16} height={2} className="flex-shrink-0">
              <line x1={0} y1={1} x2={16} y2={1}
                stroke={item.color} strokeWidth={2}
                strokeDasharray={item.dash ? '3 2' : undefined} />
            </svg>
            <span className="text-[9px] text-[#4B5563] whitespace-nowrap">{item.label}</span>
          </div>
        ))}
      </div>

      {/* zoom 힌트 */}
      <p className="absolute bottom-3 left-3 text-[9px] text-[#374151] pointer-events-none">
        스크롤·핀치로 확대/축소
      </p>
    </div>
  );
}
