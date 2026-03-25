'use client';

/**
 * NewsImpactCard 컴포넌트
 * 개별 뉴스 임팩트 항목을 카드 형태로 표시
 * 즐겨찾기 토글 + 관련 종목 태그 클릭 시 차트 팝업
 */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TrafficLightSignal, AiBadge, StockChart } from '@/components/common';
import type { NewsImpactCardData } from '../types';
import type { StockPriceResponse } from '@/types/market.types';

/** localStorage 즐겨찾기 키 */
const FAVORITES_KEY = 'fanen-news-favorites';

/** localStorage에서 즐겨찾기 목록 로드 */
function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

/** localStorage에 즐겨찾기 목록 저장 */
function saveFavorites(ids: Set<string>): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage 사용 불가 시 무시
  }
}

// Railway API URL (클라이언트에서 직접 호출)
const RAILWAY_API_URL =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'http://localhost:8000';

/** 종목 차트 팝업 모달 */
function StockChartModal({
  stockCode,
  stockName,
  onClose,
}: {
  stockCode: string;
  stockName: string;
  onClose: () => void;
}) {
  const [chartData, setChartData] = useState<StockPriceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${RAILWAY_API_URL}/api/krx/stock?code=${stockCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('종목 데이터 조회 실패');
        return res.json() as Promise<StockPriceResponse>;
      })
      .then((data) => setChartData(data))
      .catch(() => {
        // 실패 시 null 유지
      })
      .finally(() => setLoading(false));
  }, [stockCode]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg mx-4 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            {stockName} ({stockCode})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-300 text-xl leading-none"
            aria-label="닫기"
          >
            &times;
          </button>
        </div>
        {loading && (
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700 animate-pulse h-48" />
        )}
        {!loading && chartData && (
          <StockChart
            data={chartData.chart_data}
            title={chartData.name || stockCode}
            type="line"
            isMock={chartData.mock}
          />
        )}
        {!loading && !chartData && (
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-6 text-sm text-gray-400 dark:text-slate-500 text-center">
            차트 데이터를 불러올 수 없습니다
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

interface NewsImpactCardProps {
  item: NewsImpactCardData;
  languageLevel: 'general' | 'expert';
}

export default function NewsImpactCard({ item, languageLevel }: NewsImpactCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [chartModal, setChartModal] = useState<{ code: string; name: string } | null>(null);

  // 마운트 시 즐겨찾기 상태 로드
  useEffect(() => {
    const favs = loadFavorites();
    setIsFavorite(favs.has(item.id));
  }, [item.id]);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback(() => {
    const favs = loadFavorites();
    if (favs.has(item.id)) {
      favs.delete(item.id);
    } else {
      favs.add(item.id);
    }
    saveFavorites(favs);
    setIsFavorite(favs.has(item.id));
  }, [item.id]);

  return (
    <>
      <article className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
        {/* 헤드라인 + 즐겨찾기 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 line-clamp-2">{item.headline}</h3>
          <button
            type="button"
            onClick={toggleFavorite}
            className="flex-shrink-0 text-lg leading-none focus:outline-none"
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            {isFavorite ? (
              <span className="text-red-500">&#9829;</span>
            ) : (
              <span className="text-gray-300 hover:text-red-400">&#9825;</span>
            )}
          </button>
        </div>

        {/* 메타 정보: 출처, 발행일 */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-500 mb-3">
          {item.source && <span>{item.source}</span>}
          {item.published_at && (
            <span>{new Date(item.published_at).toLocaleDateString('ko-KR')}</span>
          )}
        </div>

        {/* 매매 신호 */}
        <div className="mb-3">
          <TrafficLightSignal
            signal={item.signal}
            confidence={item.confidence}
            reason={languageLevel === 'general' ? item.ai_summary_general : item.ai_summary_expert}
          />
        </div>

        {/* AI 뱃지 + 영향 섹터 태그 */}
        <div className="flex items-center justify-between">
          <AiBadge label="반디 분석" source={item.source_url ?? undefined} />
          {/* 관련 종목 태그 — 클릭 시 차트 팝업 */}
          <div className="flex flex-wrap gap-1">
            {item.affected_stocks.slice(0, 3).map((stock, idx) => (
              <button
                key={stock}
                type="button"
                onClick={() =>
                  setChartModal({
                    code: item.stock_code ?? '',
                    name: stock,
                  })
                }
                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                title={`${stock} 차트 보기`}
              >
                {stock}
              </button>
            ))}
            {/* 영향 섹터 태그 (종목 이후) */}
            {item.affected_sectors.slice(0, 3).map((sector) => (
              <span
                key={sector}
                className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* 종목 차트 팝업 모달 */}
      {chartModal && chartModal.code && (
        <StockChartModal
          stockCode={chartModal.code}
          stockName={chartModal.name}
          onClose={() => setChartModal(null)}
        />
      )}
    </>
  );
}
