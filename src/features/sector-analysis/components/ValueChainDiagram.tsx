'use client';

/**
 * ValueChainDiagram — D3 forceSimulation 기반 밸류체인 다이어그램
 * - 글라스모피즘 무채색 팔레트 (라이트/다크)
 * - Hover 연결 강조
 * - AnimatedBeam 파티클
 * - d3.zoom/pan
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';

/* ─────────────────────────────────────────────
   상수
───────────────────────────────────────────── */

const TIER_DISTANCE: Record<number, number> = { 0: 100, 1: 90, 2: 80, 3: 70 };
const ORBIT_RADIUS: Record<number, number> = { 0: 130, 1: 230, 2: 330, 3: 420 };
const TIER_RADIUS: Record<number, number> = { [-1]: 44, 0: 28, 1: 21, 2: 16, 3: 11 };

const PALETTE = {
  light: {
    nodeFill: 'rgba(255,255,255,0.72)',
    nodeStroke: {
      '-1': 'rgba(0,0,0,0.85)',
      '0': 'rgba(0,0,0,0.55)',
      '1': 'rgba(0,0,0,0.35)',
      '2': 'rgba(0,0,0,0.22)',
      '3': 'rgba(0,0,0,0.12)',
    } as Record<string, string>,
    edge: 'rgba(0,0,0,0.1)',
    edgeBeam: 'rgba(100,100,100,0.55)',
    label: 'rgba(0,0,0,0.5)',
    labelHover: 'rgba(0,0,0,0.9)',
    hoverStroke: 'rgba(0,0,0,0.8)',
    dimOpacity: 0.12,
  },
  dark: {
    nodeFill: 'rgba(255,255,255,0.06)',
    nodeStroke: {
      '-1': 'rgba(255,255,255,0.9)',
      '0': 'rgba(255,255,255,0.55)',
      '1': 'rgba(255,255,255,0.3)',
      '2': 'rgba(255,255,255,0.18)',
      '3': 'rgba(255,255,255,0.09)',
    } as Record<string, string>,
    edge: 'rgba(255,255,255,0.08)',
    edgeBeam: 'rgba(200,200,200,0.45)',
    label: 'rgba(255,255,255,0.45)',
    labelHover: 'rgba(255,255,255,0.95)',
    hoverStroke: 'rgba(255,255,255,0.85)',
    dimOpacity: 0.08,
  },
};

const SIGNAL_LABEL: Record<string, string> = { buy: '관심', wait: '관망', watch: '주의' };
const SIGNAL_COLOR: Record<string, string> = {
  buy: 'text-blue-400',
  wait: 'text-zinc-400',
  watch: 'text-zinc-500',
};

const TIER_LEGEND = [
  { label: '중심섹터 기업', tier: 0 },
  { label: '직접납품', tier: 1 },
  { label: '부품/소재', tier: 2 },
  { label: '물류/MRO', tier: 3 },
];

/* ─────────────────────────────────────────────
   타입
───────────────────────────────────────────── */

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  tier: TierLevel | -1;
  originalNode?: ValueChainNode;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  id: string;
  tier: TierLevel;
}

interface PositionedNode {
  id: string;
  name: string;
  tier: TierLevel | -1;
  originalNode?: ValueChainNode;
  x: number;
  y: number;
}

interface PositionedEdge {
  id: string;
  tier: TierLevel;
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface TooltipState {
  node: ValueChainNode;
  x: number;
  y: number;
}

/* ─────────────────────────────────────────────
   시뮬레이션 데이터 구축
───────────────────────────────────────────── */

function buildSimData(chain: ValueChain): { simNodes: SimNode[]; simLinks: SimLink[] } {
  const simNodes: SimNode[] = [];
  const simLinks: SimLink[] = [];

  // 중앙 섹터 노드
  simNodes.push({ id: '__center__', name: chain.sectorLabel, tier: -1 });

  const tiers: Record<number, ValueChainNode[]> = { 0: [], 1: [], 2: [], 3: [] };
  chain.nodes.forEach((n) => tiers[n.tier].push(n));

  // 노드 추가
  for (const tier of [0, 1, 2, 3] as TierLevel[]) {
    tiers[tier].forEach((n) => {
      simNodes.push({ id: n.ticker, name: n.name, tier, originalNode: n });
    });
  }

  // 엣지: 중앙 → T0
  tiers[0].forEach((n) => {
    simLinks.push({ id: `center-${n.ticker}`, source: '__center__', target: n.ticker, tier: 0 });
  });

  // T0 → T1
  const parentFor = (childIdx: number, parentArr: ValueChainNode[], childArr: ValueChainNode[]) => {
    const perParent = Math.ceil(childArr.length / Math.max(parentArr.length, 1));
    return parentArr[Math.min(Math.floor(childIdx / perParent), parentArr.length - 1)];
  };

  tiers[1].forEach((n, i) => {
    const parent = parentFor(i, tiers[0], tiers[1]);
    if (parent) simLinks.push({ id: `t0-${parent.ticker}-${n.ticker}`, source: parent.ticker, target: n.ticker, tier: 1 });
  });

  // T1 → T2
  const t2Parents = tiers[1].length > 0 ? tiers[1] : tiers[0];
  tiers[2].forEach((n, i) => {
    const parent = parentFor(i, t2Parents, tiers[2]);
    if (parent) simLinks.push({ id: `t1-${parent.ticker}-${n.ticker}`, source: parent.ticker, target: n.ticker, tier: 2 });
  });

  // T2 → T3
  const t3Parents = tiers[2].length > 0 ? tiers[2] : t2Parents;
  tiers[3].forEach((n, i) => {
    const parent = parentFor(i, t3Parents, tiers[3]);
    if (parent) simLinks.push({ id: `t2-${parent.ticker}-${n.ticker}`, source: parent.ticker, target: n.ticker, tier: 3 });
  });

  return { simNodes, simLinks };
}

/* ─────────────────────────────────────────────
   NodeTooltip
───────────────────────────────────────────── */

function NodeTooltip({ tooltip }: { tooltip: TooltipState | null }) {
  if (!tooltip) return null;
  const { node, x, y } = tooltip;
  return (
    <div
      style={{ left: x, top: y, transition: 'opacity 0.15s' }}
      className="absolute z-50 w-56 pointer-events-none
        bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md
        border border-zinc-200/60 dark:border-zinc-700/40
        rounded-xl shadow-xl p-3 text-left opacity-100"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded
          bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
          T{node.tier}
        </span>
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{node.name}</span>
      </div>
      <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">{node.ticker}</p>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
        {node.relationship}
        {node.dividendYield !== undefined && node.dividendYield > 0 && (
          <span className="ml-2">배당 {node.dividendYield.toFixed(1)}%</span>
        )}
      </p>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed line-clamp-3">
        {node.description}
      </p>
      <p className={`text-[11px] font-semibold mt-1.5 ${SIGNAL_COLOR[node.signal]}`}>
        {SIGNAL_LABEL[node.signal]}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ValueChainDiagram
───────────────────────────────────────────── */

interface ValueChainDiagramProps {
  chain: ValueChain;
  onNodeClick?: (node: ValueChainNode) => void;
  selectedTicker?: string | null;
}

export function ValueChainDiagram({ chain, onNodeClick, selectedTicker }: ValueChainDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  const [containerSize, setContainerSize] = useState(600);
  const [isDark, setIsDark] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [positionedNodes, setPositionedNodes] = useState<PositionedNode[]>([]);
  const [positionedEdges, setPositionedEdges] = useState<PositionedEdge[]>([]);

  const palette = isDark ? PALETTE.dark : PALETTE.light;

  // viewBox 계산
  const maxOrbit = ORBIT_RADIUS[3];
  const padding = TIER_RADIUS[-1] + 60;
  const viewBoxSize = (maxOrbit + padding) * 2;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;

  // 시뮬레이션 데이터
  const { simNodes, simLinks } = useMemo(() => buildSimData(chain), [chain]);

  // D3 forceSimulation
  useEffect(() => {
    // 노드 복사 (D3가 mutate하므로)
    const nodes: SimNode[] = simNodes.map((n) => ({ ...n }));
    const links: SimLink[] = simLinks.map((l) => ({ ...l }));

    const simulation = d3.forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((d: SimLink) => TIER_DISTANCE[d.tier ?? 0])
      )
      .force('charge', d3.forceManyBody().strength(-60))
      .force(
        'collide',
        d3.forceCollide<SimNode>().radius((d) => (TIER_RADIUS[d.tier as number] ?? 11) + 10)
      )
      .force(
        'radial',
        d3.forceRadial<SimNode>(
          (d) => (d.tier === -1 ? 0 : ORBIT_RADIUS[d.tier as number] ?? 130),
          cx,
          cy
        ).strength(0.85)
      )
      .force('center', d3.forceCenter(cx, cy).strength(0.03));

    // 중앙 노드 고정
    nodes[0].fx = cx;
    nodes[0].fy = cy;

    // tick 완료 후 한번에 state 업데이트
    simulation.on('end', () => {
      const pNodes: PositionedNode[] = nodes.map((n) => ({
        id: n.id,
        name: n.name,
        tier: n.tier,
        originalNode: n.originalNode,
        x: n.x ?? cx,
        y: n.y ?? cy,
      }));

      const nodeMap = new Map(pNodes.map((n) => [n.id, n]));
      const pEdges: PositionedEdge[] = links.map((l) => {
        const sourceId = typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source);
        const targetId = typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target);
        const s = nodeMap.get(sourceId);
        const t = nodeMap.get(targetId);
        return {
          id: l.id,
          tier: l.tier,
          sourceId,
          targetId,
          x1: s?.x ?? cx,
          y1: s?.y ?? cy,
          x2: t?.x ?? cx,
          y2: t?.y ?? cy,
        };
      });

      setPositionedNodes(pNodes);
      setPositionedEdges(pEdges);
    });

    // 빠르게 수렴시키기 위해 alpha 높게 시작
    simulation.alpha(1).restart();

    return () => { simulation.stop(); };
  }, [simNodes, simLinks, cx, cy]);

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
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        if (gRef.current) {
          gRef.current.setAttribute('transform', event.transform.toString());
        }
      });
    const svgSelection = d3.select(svgRef.current);
    svgSelection.call(zoom);
    return () => { svgSelection.on('.zoom', null); };
  }, [containerSize]);

  // Hover 연결 강조용 neighbor 계산
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    positionedEdges.forEach((e) => {
      if (!map.has(e.sourceId)) map.set(e.sourceId, new Set());
      if (!map.has(e.targetId)) map.set(e.targetId, new Set());
      map.get(e.sourceId)!.add(e.targetId);
      map.get(e.targetId)!.add(e.sourceId);
    });
    return map;
  }, [positionedEdges]);

  const isNeighbor = useCallback(
    (nodeId: string) => {
      if (!hoveredId) return true;
      if (nodeId === hoveredId) return true;
      return neighbors.get(hoveredId)?.has(nodeId) ?? false;
    },
    [hoveredId, neighbors]
  );

  const isEdgeConnected = useCallback(
    (edge: PositionedEdge) => {
      if (!hoveredId) return true;
      return edge.sourceId === hoveredId || edge.targetId === hoveredId;
    },
    [hoveredId]
  );

  // 이벤트 핸들러
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGGElement>, node: ValueChainNode) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setHoveredId(node.ticker);
      setTooltip({ node, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 20 });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGGElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setTooltip((prev) =>
        prev ? { ...prev, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 20 } : prev
      );
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl
        bg-white/45 dark:bg-black/50 backdrop-blur-xl
        border border-white/60 dark:border-white/[0.08]
        shadow-lg dark:shadow-black/40"
      style={{ height: containerSize }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={containerSize}
        height={containerSize}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="밸류체인 다이어그램"
      >
        <g ref={gRef}>
          {/* ── 엣지 (path + animateMotion) ── */}
          <g>
            {positionedEdges.map((edge, edgeIdx) => {
              const connected = isEdgeConnected(edge);
              return (
                <g key={edge.id}>
                  <path
                    id={`edge-${edge.id}`}
                    d={`M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`}
                    stroke={palette.edge}
                    strokeOpacity={hoveredId ? (connected ? 0.5 : 0.04) : 0.18}
                    strokeWidth={edge.tier === 0 ? 1.5 : 1}
                    strokeDasharray={edge.tier === 3 ? '4 3' : undefined}
                    fill="none"
                    style={{ transition: 'stroke-opacity 0.18s' }}
                  />
                  {/* AnimatedBeam 파티클 */}
                  <circle r={1.8} fill={palette.edgeBeam} opacity={hoveredId && !connected ? 0.04 : 0.7}>
                    <animateMotion
                      dur={`${2.5 + (edgeIdx % 4) * 0.6}s`}
                      repeatCount="indefinite"
                      begin={`${(edgeIdx * 0.25) % 2}s`}
                    >
                      <mpath href={`#edge-${edge.id}`} />
                    </animateMotion>
                  </circle>
                </g>
              );
            })}
          </g>

          {/* ── 노드 ── */}
          <g>
            {positionedNodes.map((node) => {
              const r = TIER_RADIUS[node.tier as number] ?? 11;
              const isCenter = node.tier === -1;
              const isSelected = node.originalNode?.ticker === selectedTicker;
              const isHovered = hoveredId === node.id;
              const connected = isNeighbor(node.id);

              const strokeKey = String(node.tier);
              const stroke = isHovered || isSelected
                ? palette.hoverStroke
                : palette.nodeStroke[strokeKey] ?? palette.nodeStroke['2'];
              const strokeWidth = isSelected ? 2.5 : isHovered ? 2 : isCenter ? 2 : 1.5;

              const nodeOpacity = hoveredId && !isCenter && !connected
                ? palette.dimOpacity
                : 1;

              return (
                <g
                  key={node.id}
                  style={{
                    cursor: node.originalNode ? 'pointer' : 'default',
                    transition: 'opacity 0.18s, stroke-width 0.18s',
                    opacity: nodeOpacity,
                  }}
                  onClick={() => node.originalNode && onNodeClick?.(node.originalNode)}
                  onMouseEnter={
                    node.originalNode
                      ? (e) => handleMouseEnter(e as React.MouseEvent<SVGGElement>, node.originalNode!)
                      : undefined
                  }
                  onMouseMove={
                    node.originalNode
                      ? (e) => handleMouseMove(e as React.MouseEvent<SVGGElement>)
                      : undefined
                  }
                  onMouseLeave={node.originalNode ? handleMouseLeave : undefined}
                  aria-label={node.name}
                >
                  {/* 노드 원 */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill={palette.nodeFill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={node.tier === 3 ? '4 2' : undefined}
                    style={{ transition: 'stroke 0.18s, stroke-width 0.18s' }}
                  />

                  {/* 중앙 노드 텍스트 */}
                  {isCenter && (
                    <text
                      x={node.x}
                      y={node.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'}
                      fontSize={13}
                      fontWeight="700"
                      letterSpacing="-0.3"
                    >
                      {node.name}
                    </text>
                  )}

                  {/* 일반 노드 레이블 */}
                  {!isCenter && (
                    <text
                      x={node.x}
                      y={node.y + r + 11}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isHovered || isSelected ? palette.labelHover : palette.label}
                      fontSize={9}
                      fontWeight={isSelected ? '700' : '400'}
                      style={{ transition: 'fill 0.18s' }}
                    >
                      {node.name.length > 7 ? node.name.slice(0, 6) + '\u2026' : node.name}
                    </text>
                  )}

                  {/* 선택 강조 링 */}
                  {isSelected && !isCenter && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 6}
                      fill="none"
                      stroke={palette.hoverStroke}
                      strokeWidth={1}
                      strokeOpacity={0.4}
                      strokeDasharray="4 2"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* 툴팁 */}
      {tooltip && <NodeTooltip tooltip={tooltip} />}

      {/* 범례 */}
      <div
        className="absolute bottom-3 right-3 flex flex-col gap-1 pointer-events-none
          bg-white/60 dark:bg-black/40 backdrop-blur-md
          border border-white/40 dark:border-white/[0.06]
          rounded-lg px-2.5 py-2"
      >
        {TIER_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <svg width={16} height={2} className="flex-shrink-0">
              <line
                x1={0}
                y1={1}
                x2={16}
                y2={1}
                stroke={palette.nodeStroke[String(item.tier)]}
                strokeWidth={2}
                strokeDasharray={item.tier === 3 ? '3 2' : undefined}
              />
            </svg>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              T{item.tier}: {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* zoom 힌트 */}
      <p className="absolute bottom-3 left-3 text-[9px] text-zinc-400 dark:text-zinc-500 pointer-events-none">
        스크롤/핀치로 확대/축소
      </p>
    </div>
  );
}
