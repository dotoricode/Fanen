'use client';

/**
 * NewsImpactList 컴포넌트
 * 뉴스 임팩트 카드 목록 — 필터 바, 구독 게이트, 언어 토글 통합
 */
import { useState, useMemo } from 'react';
import { LanguageToggle, SubscriptionGate } from '@/components/common';
import { useNewsImpacts } from '../hooks/useNewsImpacts';
import { useSubscription } from '@/hooks/useSubscription';
import NewsImpactCard from './NewsImpactCard';
import type { NewsImpactCardData } from '../types';

/** 섹터 필터 옵션 */
const SECTOR_OPTIONS = [
  '전체', 'IT', '반도체', '바이오', '금융', '제조', '자동차',
  '철강', '소재', '방산', '에너지', '플랫폼', '헬스케어', '2차전지', '전력', '항공', '은행',
] as const;

/** 영향도 필터 레벨 */
type ImpactLevel = '전체' | '높음' | '중간' | '낮음';

export default function NewsImpactList() {
  // 플랜 조회 (prop 대신 훅 직접 사용)
  const { plan } = useSubscription();
  // 언어 레벨 상태 (일반인/전문가 모드)
  const [languageLevel, setLanguageLevel] = useState<'general' | 'expert'>('general');
  const { data, loading, error } = useNewsImpacts();

  // 섹터 다중 선택 필터 (빈 배열 = 전체)
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [impactFilter, setImpactFilter] = useState<ImpactLevel>('전체');

  // 섹터 토글 — 이미 선택됐으면 제거, 없으면 추가
  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return data.filter((item: NewsImpactCardData) => {
      // 섹터 다중 필터 — 선택된 섹터 중 하나라도 포함되면 통과
      if (selectedSectors.length > 0) {
        const matchesSector = selectedSectors.some((sel) =>
          item.affected_sectors.some((s) => s.includes(sel) || sel.includes(s))
        );
        if (!matchesSector) return false;
      }
      // 영향도 필터
      if (impactFilter === '높음' && item.impact_score < 67) return false;
      if (impactFilter === '중간' && (item.impact_score < 34 || item.impact_score >= 67)) return false;
      if (impactFilter === '낮음' && item.impact_score >= 34) return false;
      return true;
    });
  }, [data, selectedSectors, impactFilter]);

  // 필터 초기화
  const resetFilters = () => {
    setSelectedSectors([]);
    setImpactFilter('전체');
  };

  const hasActiveFilter = selectedSectors.length > 0 || impactFilter !== '전체';

  return (
    <section className="space-y-4">
      {/* 상단: 타이틀 + LanguageToggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">뉴스 임팩트</h2>
        <LanguageToggle
          onChange={(level) => setLanguageLevel(level)}
          defaultLevel="general"
        />
      </div>

      {/* 필터 바 */}
      <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-3">
        {/* 섹터 다중 선택 태그 */}
        <div>
          <span className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-2 block">
            섹터 {selectedSectors.length > 0 && <span className="text-blue-600">({selectedSectors.length}개 선택)</span>}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SECTOR_OPTIONS.filter((s) => s !== '전체').map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => toggleSector(sector)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSectors.includes(sector)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* 영향도 필터 + 초기화 */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-medium text-gray-600 dark:text-slate-400 mr-1">영향도</span>
          {(['전체', '높음', '중간', '낮음'] as ImpactLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setImpactFilter(level)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                impactFilter === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {level === '높음' ? '높음(7+)' : level === '중간' ? '중간(4~7)' : level === '낮음' ? '낮음(~4)' : level}
            </button>
          ))}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 underline"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 구독 게이트 — Pro 이상 필요 */}
      <SubscriptionGate requiredPlan="pro" currentPlan={plan}>
        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* 에러 메시지 */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {/* 빈 데이터 안내 */}
        {!loading && !error && filteredData.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            {hasActiveFilter
              ? '필터 조건에 맞는 뉴스가 없습니다. 필터를 조정해보세요.'
              : '표시할 뉴스 임팩트 정보가 없습니다.'}
          </div>
        )}

        {/* 카드 목록 */}
        {!loading && filteredData.length > 0 && (
          <div className="space-y-3">
            {filteredData.map((item) => (
              <NewsImpactCard
                key={item.id}
                item={item}
                languageLevel={languageLevel}
              />
            ))}
          </div>
        )}
      </SubscriptionGate>
    </section>
  );
}
