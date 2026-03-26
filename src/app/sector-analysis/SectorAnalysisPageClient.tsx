'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSectorAnalysis } from '@/features/sector-analysis/hooks/useSectorAnalysis';
import { ValueChainDiagram } from '@/features/sector-analysis/components/ValueChainDiagram';
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
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('detail');

  const handleSectorChange = (key: string) => {
    setSelectedNode(null);
    router.replace(`/sector-analysis?sector=${key}`);
  };

  const handleNodeClick = (node: ValueChainNode) => {
    setSelectedNode((prev) => prev?.ticker === node.ticker ? null : node);
  };

  return (
    <div className="space-y-4">
      {/* 뷰 모드 토글 */}
      <div className="flex justify-end mb-3">
        <div className="inline-flex rounded-full p-0.5 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/30">
          {(['overview', 'detail'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {mode === 'overview' ? '전체 뷰' : '상세 뷰'}
            </button>
          ))}
        </div>
      </div>

      {/* 뷰 모드 전환 애니메이션 */}
      <AnimatePresence mode="wait">
      {/* 전체 뷰 모드: 준비 중 placeholder */}
      {viewMode === 'overview' && (
        <motion.div
          key="overview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center h-[520px] rounded-2xl border border-zinc-200/80 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md"
        >
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">전체 뷰 준비 중</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">밸류체인 다이어그램이 곧 제공됩니다</p>
          </div>
        </motion.div>
      )}

      {/* 상세 뷰 모드: 기존 탭 구조 */}
      {viewMode === 'detail' && (
        <motion.div
          key="detail"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
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
                  {/* 이벤트 트리거 배너 (fade-in) */}
                  <motion.div
                    key={sector + '-banner'}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/30 bg-white/60 dark:bg-zinc-800/40 backdrop-blur-sm px-4 py-3"
                  >
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 mr-2">트리거:</span>
                      {chain.eventTrigger}
                    </p>
                  </motion.div>

                  {/* 방사형 마인드맵 (섹터 전환 fade-in) */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sector + '-diagram'}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <ValueChainDiagram
                        chain={chain}
                        onNodeClick={handleNodeClick}
                        selectedTicker={selectedNode?.ticker ?? null}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* 선택 노드 디테일 패널 (슬라이드업) */}
                  <AnimatePresence>
                    {selectedNode && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SectorDetailPanel
                          node={selectedNode}
                          onClose={() => setSelectedNode(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-xs text-zinc-400 dark:text-zinc-500 text-right">
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
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
