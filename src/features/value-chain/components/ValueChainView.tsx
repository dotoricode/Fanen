'use client';

/**
 * 밸류체인 시각화 컴포넌트 (v0.0.2)
 * 데스크톱: d3-sankey Sankey 다이어그램
 * 모바일(<768px): 티어별 계층 리스트 (fallback)
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import type {
  SankeyNode as D3SankeyNode,
  SankeyLink as D3SankeyLink,
  SankeyGraph,
} from 'd3-sankey';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';
import { TierBadge } from './TierBadge';
import { CompanyCard } from './CompanyCard';

/** Sankey 노드 데이터 */
interface SankeyNodeData {
  id: string;
  name: string;
  tier: TierLevel | -1; // -1: 이벤트/섹터 가상 노드
  originalNode?: ValueChainNode;
}

/** Sankey 링크 데이터 */
interface SankeyLinkData {
  value: number;
}

type SNode = D3SankeyNode<SankeyNodeData, SankeyLinkData>;
type SLink = D3SankeyLink<SankeyNodeData, SankeyLinkData>;

/** 티어별 색상 */
const TIER_COLORS: Record<number, string> = {
  [-1]: '#0D9488', // 이벤트/섹터 가상 노드 — teal
  0: '#0D9488',   // 메이저 — teal
  1: '#3B82F6',   // T1 — blue
  2: '#8B5CF6',   // T2 — purple
  3: '#64748B',   // T3 — slate
};

/** 티어 레이블 */
const TIER_LABELS: Record<TierLevel, string> = {
  0: '메이저 (T0)',
  1: 'T1 직접납품',
  2: 'T2 부품소재',
  3: 'T3 간접수혜',
};

const TIER_HEADER_CLASS: Record<TierLevel, string> = {
  0: 'bg-teal-900/30 border-teal-800',
  1: 'bg-blue-900/30 border-blue-800',
  2: 'bg-purple-900/30 border-purple-800',
  3: 'bg-slate-800/60 border-slate-700',
};

interface ValueChainViewProps {
  chain: ValueChain;
}

/** Sankey 그래프 데이터 빌드 */
function buildSankeyData(chain: ValueChain): {
  nodes: SankeyNodeData[];
  links: { source: number; target: number; value: number }[];
} {
  const nodes: SankeyNodeData[] = [
    { id: '__event__', name: chain.eventTrigger.slice(0, 20) + '…', tier: -1 },
    { id: '__sector__', name: chain.sectorLabel, tier: -1 },
  ];
  const nodeIndexMap: Record<string, number> = {
    __event__: 0,
    __sector__: 1,
  };

  chain.nodes.forEach((n) => {
    nodeIndexMap[n.ticker] = nodes.length;
    nodes.push({ id: n.ticker, name: n.name, tier: n.tier, originalNode: n });
  });

  const links: { source: number; target: number; value: number }[] = [];

  // 이벤트 → 섹터
  links.push({ source: 0, target: 1, value: 8 });

  // 섹터 → T0
  chain.nodes
    .filter((n) => n.tier === 0)
    .forEach((n) => {
      links.push({ source: 1, target: nodeIndexMap[n.ticker], value: 4 });
    });

  // T0 → T1 (T0 노드 각각 → T1 노드 순서로 연결)
  const t0 = chain.nodes.filter((n) => n.tier === 0);
  const t1 = chain.nodes.filter((n) => n.tier === 1);
  const t2 = chain.nodes.filter((n) => n.tier === 2);
  const t3 = chain.nodes.filter((n) => n.tier === 3);

  t0.forEach((src) => {
    t1.forEach((dst) => {
      links.push({ source: nodeIndexMap[src.ticker], target: nodeIndexMap[dst.ticker], value: 2 });
    });
  });
  t1.forEach((src) => {
    t2.forEach((dst) => {
      links.push({ source: nodeIndexMap[src.ticker], target: nodeIndexMap[dst.ticker], value: 1 });
    });
  });
  t2.forEach((src) => {
    t3.forEach((dst) => {
      links.push({ source: nodeIndexMap[src.ticker], target: nodeIndexMap[dst.ticker], value: 1 });
    });
  });

  return { nodes, links };
}

/** D3 Sankey 다이어그램 컴포넌트 */
function SankeyDiagram({
  chain,
  onNodeClick,
  selectedTicker,
}: {
  chain: ValueChain;
  onNodeClick: (node: ValueChainNode) => void;
  selectedTicker: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 400;

    const { nodes, links } = buildSankeyData(chain);

    // SVG 초기화
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const sankeyGen = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(24)
      .nodePadding(12)
      .extent([
        [16, 16],
        [width - 16, height - 16],
      ]);

    const graph: SankeyGraph<SankeyNodeData, SankeyLinkData> = sankeyGen({
      nodes: nodes.map((d) => ({ ...d })),
      links: links.map((d) => ({ ...d })),
    });

    const g = svg.append('g');

    // 링크
    g.append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const src = d.source as SNode;
        return TIER_COLORS[src.tier] ?? '#64748B';
      })
      .attr('stroke-width', (d) => Math.max(1, d.width ?? 1))
      .attr('stroke-opacity', 0.3)
      .on('mouseover', function () {
        d3.select(this).attr('stroke-opacity', 0.6);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-opacity', 0.3);
      });

    // 노드 그룹
    const node = g
      .append('g')
      .selectAll('g')
      .data(graph.nodes)
      .join('g')
      .style('cursor', (d) => (d.originalNode ? 'pointer' : 'default'))
      .on('click', (_event, d) => {
        if (d.originalNode) onNodeClick(d.originalNode);
      });

    // 노드 사각형
    node
      .append('rect')
      .attr('x', (d) => d.x0 ?? 0)
      .attr('y', (d) => d.y0 ?? 0)
      .attr('height', (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr('width', (d) => Math.max(1, (d.x1 ?? 0) - (d.x0 ?? 0)))
      .attr('fill', (d) => TIER_COLORS[d.tier] ?? '#64748B')
      .attr('fill-opacity', (d) =>
        selectedTicker && d.originalNode?.ticker === selectedTicker ? 1 : 0.75
      )
      .attr('rx', 3)
      .attr('stroke', (d) =>
        selectedTicker && d.originalNode?.ticker === selectedTicker ? '#fff' : 'none'
      )
      .attr('stroke-width', 1.5);

    // 노드 레이블
    node
      .append('text')
      .attr('x', (d) => ((d.x0 ?? 0) + (d.x1 ?? 0)) / 2)
      .attr('y', (d) => (d.y0 ?? 0) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#CBD5E1')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text((d) => (d.originalNode ? d.originalNode.ticker : d.name))
      .each(function (d) {
        // 텍스트가 길면 잘라냄
        const text = d3.select(this);
        const label = d.originalNode ? d.originalNode.name : d.name;
        if (label.length > 8) text.text(label.slice(0, 7) + '…');
        else text.text(label);
      });
  }, [chain, selectedTicker, onNodeClick]);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!containerRef.current || !svgRef.current) return;
      const width = containerRef.current.clientWidth;
      d3.select(svgRef.current).attr('width', width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <svg ref={svgRef} height={400} className="w-full" />
    </div>
  );
}

/** 모바일용 계층 리스트 */
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
            <div className="flex justify-center py-1 text-slate-600 text-lg">↓</div>
          )}
          <div className={`rounded-t-lg border-x border-t px-3 py-2 ${TIER_HEADER_CLASS[tier]}`}>
            <span className="text-xs font-semibold text-slate-300">{TIER_LABELS[tier]}</span>
            <span className="ml-2 text-xs text-slate-500">({nodes.length}개)</span>
          </div>
          <div className="border-x border-b border-slate-700 rounded-b-lg space-y-1 p-2">
            {nodes.map((node) => (
              <button
                key={node.ticker}
                type="button"
                onClick={() => onNodeClick(node)}
                className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors hover:bg-slate-700 ${
                  selectedNode?.ticker === node.ticker
                    ? 'bg-slate-700 ring-1 ring-teal-500'
                    : 'bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TierBadge tier={node.tier} />
                  <span className="font-semibold text-slate-100">{node.name}</span>
                  <span className="text-slate-400 font-mono">{node.ticker}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 메인 ValueChainView 컴포넌트 */
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
    setSelectedNode((prev) => (prev?.ticker === node.ticker ? null : node));
  };

  return (
    <div className="space-y-4">
      {/* 이벤트 트리거 */}
      <div className="rounded-lg border border-teal-700/50 bg-teal-900/20 px-4 py-3">
        <p className="text-sm text-teal-300">
          <span className="font-semibold mr-2">트리거:</span>
          {chain.eventTrigger}
        </p>
      </div>

      {/* 데스크톱: Sankey / 모바일: 계층 리스트 */}
      {isMobile ? (
        <TierList chain={chain} selectedNode={selectedNode} onNodeClick={handleNodeClick} />
      ) : (
        <div className="rounded-xl border border-slate-700 bg-[#0F1923] p-4">
          <SankeyDiagram
            chain={chain}
            onNodeClick={handleNodeClick}
            selectedTicker={selectedNode?.ticker ?? null}
          />
          <p className="text-xs text-slate-600 mt-2 text-center">
            노드를 클릭하면 종목 상세 정보를 볼 수 있습니다
          </p>
        </div>
      )}

      {/* 선택 노드 상세 카드 */}
      {selectedNode && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-200">종목 상세</h3>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              닫기 ✕
            </button>
          </div>
          <CompanyCard node={selectedNode} isSelected onClick={() => setSelectedNode(null)} />
        </div>
      )}

      <p className="text-xs text-slate-600 text-right">
        마지막 업데이트: {new Date(chain.updatedAt).toLocaleString('ko-KR')}
      </p>
    </div>
  );
}
