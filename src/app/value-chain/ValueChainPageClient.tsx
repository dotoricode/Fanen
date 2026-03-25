'use client';

import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useValueChain } from '@/features/value-chain/hooks/useValueChain';
import { ValueChainView } from '@/features/value-chain/components/ValueChainView';

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

interface ValueChainPageClientProps {
  sector: string;
}

/** 수혜 기업 연결망 페이지 클라이언트 컴포넌트 — shadcn/ui Tabs 적용 */
export function ValueChainPageClient({ sector }: ValueChainPageClientProps) {
  const router = useRouter();
  const { chain, isLoading, error } = useValueChain(sector);

  const handleSectorChange = (key: string) => {
    router.replace(`/value-chain?sector=${key}`);
  };

  return (
    <Tabs value={sector} onValueChange={handleSectorChange}>
      {/* 섹터 탭 선택 */}
      <TabsList className="flex flex-wrap gap-1 h-auto p-1">
        {SECTOR_TABS.map((tab) =>
          tab.active ? (
            /* 활성 탭 */
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ) : (
            /* 비활성 탭 — 클릭 불가, 흐린 텍스트 + 준비중 배지 */
            <button
              key={tab.key}
              type="button"
              disabled
              aria-disabled="true"
              className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
                opacity-40 cursor-not-allowed
                text-zinc-500 dark:text-zinc-500
                select-none"
            >
              {tab.label}
              <span
                className="inline-flex items-center rounded-full bg-zinc-200 dark:bg-zinc-700
                  px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400
                  leading-none"
              >
                준비중
              </span>
            </button>
          )
        )}
      </TabsList>

      {/* 각 활성 섹터 콘텐츠만 렌더링 */}
      {SECTOR_TABS.filter((tab) => tab.active).map((tab) => (
        <TabsContent key={tab.key} value={tab.key}>
          {/* 로딩 스켈레톤 */}
          {isLoading && (
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded-lg bg-slate-200 dark:bg-zinc-900" />
              <div className="h-[520px] rounded-xl bg-slate-200 dark:bg-zinc-900" />
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
              데이터를 불러오는 중 오류가 발생했습니다: {error.message}
            </div>
          )}

          {/* 수혜 기업 연결망 뷰 */}
          {!isLoading && !error && chain && <ValueChainView chain={chain} />}

          {/* 데이터 없음 */}
          {!isLoading && !error && !chain && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-500">
              해당 섹터의 수혜 기업 연결망 데이터가 없습니다.
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
