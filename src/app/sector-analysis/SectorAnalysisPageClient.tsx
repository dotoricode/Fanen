'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSectorAnalysis } from '@/features/sector-analysis/hooks/useSectorAnalysis';
import { SectorMindmapView } from '@/features/sector-analysis/components/SectorMindmapView';
import { SectorDetailPanel } from '@/features/sector-analysis/components/SectorDetailPanel';
import type { ValueChainNode } from '@/features/sector-analysis/types';

/**
 * 섹터 탭 목록
 * active: true → 데이터 있음 (활성 탭)
 * active: false → 준비 중 (비활성, 클릭 불가)
 */
const SECTOR_TABS = [
  { key: 'defense',       label: '방산',      active: true  },
  { key: 'semiconductor', label: '반도체',    active: true  },
  { key: 'battery',       label: '2차전지',   active: true  },
  { key: 'energy',        label: '에너지',    active: false },
  { key: 'bio',           label: '바이오',    active: false },
  { key: 'ai',            label: 'AI/플랫폼', active: false },
] as const;

interface SectorAnalysisPageClientProps {
  sector: string;
}

/** 섹터 분석 페이지 클라이언트 컴포넌트 */
export function SectorAnalysisPageClient({ sector }: SectorAnalysisPageClientProps) {
  const router = useRouter();
  const { chain, isLoading, error } = useSectorAnalysis(sector);
  const [selectedNode, setSelectedNode] = useState<ValueChainNode | null>(null);

  const handleSectorChange = (key: string) => {
    setSelectedNode(null);
    router.replace(`/sector-analysis?sector=${key}`);
  };

  const handleNodeClick = (node: ValueChainNode) => {
    setSelectedNode((prev) => prev?.ticker === node.ticker ? null : node);
  };

  return (
    <Tabs value={sector} onValueChange={handleSectorChange}>
      {/* 섹터 탭 선택 */}
      <TabsList className="flex flex-wrap gap-1 h-auto p-1">
        {SECTOR_TABS.map((tab) =>
          tab.active ? (
            <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
          ) : (
            <button
              key={tab.key}
              type="button"
              disabled
              aria-disabled="true"
              className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
                opacity-40 cursor-not-allowed text-zinc-500 dark:text-zinc-500 select-none"
            >
              {tab.label}
              <span className="inline-flex items-center rounded-full bg-zinc-200 dark:bg-zinc-700
                px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-none">
                준비중
              </span>
            </button>
          )
        )}
      </TabsList>

      {/* 활성 섹터 콘텐츠 */}
      {SECTOR_TABS.filter((tab) => tab.active).map((tab) => (
        <TabsContent key={tab.key} value={tab.key}>
          {/* 로딩 */}
          {isLoading && (
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded-lg bg-zinc-200 dark:bg-zinc-900" />
              <div className="h-[520px] rounded-xl bg-zinc-200 dark:bg-zinc-900" />
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
              데이터를 불러오는 중 오류가 발생했습니다: {error.message}
            </div>
          )}

          {/* 섹터 분석 뷰 */}
          {!isLoading && !error && chain && (
            <div className="space-y-4">
              {/* 이벤트 트리거 배너 */}
              <div className="rounded-lg border border-[#374151] bg-[#1F2937] px-4 py-3">
                <p className="text-sm text-[#9CA3AF]">
                  <span className="font-semibold text-[#E5E7EB] mr-2">트리거:</span>
                  {chain.eventTrigger}
                </p>
              </div>

              {/* 방사형 마인드맵 */}
              <SectorMindmapView
                chain={chain}
                onNodeClick={handleNodeClick}
                selectedTicker={selectedNode?.ticker ?? null}
              />

              {/* 선택 노드 디테일 패널 */}
              {selectedNode && (
                <SectorDetailPanel
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                />
              )}

              <p className="text-xs text-[#374151] text-right">
                마지막 업데이트: {new Date(chain.updatedAt).toLocaleString('ko-KR')}
              </p>
            </div>
          )}

          {/* 데이터 없음 */}
          {!isLoading && !error && !chain && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-500">
              해당 섹터의 분석 데이터가 없습니다.
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
