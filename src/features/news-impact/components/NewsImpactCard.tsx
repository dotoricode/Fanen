'use client';

/**
 * NewsImpactCard 컴포넌트 (v2 리디자인)
 * 레이아웃: 좌측 main(80%) + 우측 signal 패널(20%)
 * 섹터 뱃지와 영향도 신호등을 완전 분리
 */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AiBadge from '@/components/common/AiBadge';
import StockChart from '@/components/common/StockChart';
import type { NewsImpactCardData } from '../types';
import type { StockPriceResponse } from '@/types/market.types';

const FAVORITES_KEY = 'fanen-news-favorites';

function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(ids: Set<string>): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
  } catch {}
}

const RAILWAY_API_URL =
  process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'http://localhost:8000';

/** 신호 컬러 설정 */
const SIGNAL_CONFIG = {
  buy: {
    bg: 'bg-teal-500',
    text: '매수',
    dot: 'bg-teal-500',
    label: 'text-teal-700 dark:text-teal-400',
    /** 우측 패널 배경 */
    panel: 'bg-teal-50 dark:bg-teal-950/30 border-l-2 border-teal-500',
    /** 점수 색상 */
    score: 'text-teal-700 dark:text-teal-300',
  },
  hold: {
    bg: 'bg-amber-400',
    text: '관망',
    dot: 'bg-amber-400',
    label: 'text-amber-700 dark:text-amber-400',
    panel: 'bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-500',
    score: 'text-amber-700 dark:text-amber-300',
  },
  sell: {
    bg: 'bg-rose-500',
    text: '매도',
    dot: 'bg-rose-500',
    label: 'text-rose-700 dark:text-rose-400',
    panel: 'bg-rose-50 dark:bg-rose-950/30 border-l-2 border-rose-500',
    score: 'text-rose-700 dark:text-rose-300',
  },
} as const;

/** 영향도 점수 → 진행 바 색상 */
const impactBarColor = (score: number) =>
  score >= 67 ? 'bg-rose-500' : score >= 34 ? 'bg-amber-400' : 'bg-teal-500';

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
    fetch(`${RAILWAY_API_URL}/api/krx/stock?code=${encodeURIComponent(stockCode)}`)
      .then((res) => {
        if (!res.ok) throw new Error('종목 데이터 조회 실패');
        return res.json() as Promise<StockPriceResponse>;
      })
      .then((data) => setChartData(data))
      .catch((err) => console.error('[StockChartModal] 차트 로드 실패:', err))
      .finally(() => setLoading(false));
  }, [stockCode]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg mx-4 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{stockName} ({stockCode})</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xl leading-none" aria-label="닫기">&times;</button>
        </div>
        {loading && <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 animate-pulse h-48" />}
        {!loading && chartData && (
          <StockChart data={chartData.chart_data} title={chartData.name || stockCode} type="line" isMock={chartData.mock} />
        )}
        {!loading && !chartData && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-6 text-sm text-zinc-400 dark:text-zinc-500 text-center">
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
}

export default function NewsImpactCard({ item }: NewsImpactCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [chartModal, setChartModal] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    setIsFavorite(loadFavorites().has(item.id));
  }, [item.id]);

  const toggleFavorite = useCallback(() => {
    const favs = loadFavorites();
    favs.has(item.id) ? favs.delete(item.id) : favs.add(item.id);
    saveFavorites(favs);
    setIsFavorite(favs.has(item.id));
  }, [item.id]);

  const sig = SIGNAL_CONFIG[item.signal] ?? SIGNAL_CONFIG.hold;

  return (
    <>
      <article className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* ── 외부 flex-row: 좌측 신호 바 + 메인 영역 + 우측 신호 패널 ── */}
        <div className="flex min-h-[7rem]">
          {/* 1. 좌측 신호 컬러 바 (4px) */}
          <div className={`w-1 flex-shrink-0 ${sig.bg}`} />

          {/* 2. 메인 콘텐츠 영역 (flex-1) */}
          <div className="flex-1 p-4 flex flex-col gap-2.5 min-w-0">
            {/* 헤드라인 + 즐겨찾기 */}
            <div className="flex items-start gap-2">
              <h3 className="flex-1 text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {item.headline}
              </h3>
              <button
                type="button"
                onClick={toggleFavorite}
                className="flex-shrink-0 text-lg leading-none focus:outline-none mt-0.5"
                aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                {isFavorite
                  ? <span className="text-rose-500">&#9829;</span>
                  : <span className="text-zinc-300 hover:text-rose-400">&#9825;</span>
                }
              </button>
            </div>

            {/* AI 요약 */}
            {item.ai_summary_general && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {item.ai_summary_general}
              </p>
            )}

            {/* 섹터 뱃지 행 (섹터만 — 종목은 별도 표시) */}
            {item.affected_sectors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.affected_sectors.slice(0, 4).map((sector) => (
                  <span
                    key={sector}
                    className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full font-medium"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            )}

            {/* 관련 종목 뱃지 행 (클릭 시 차트) */}
            {item.affected_stocks.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.affected_stocks.slice(0, 3).map((stock) => (
                  <button
                    key={stock}
                    type="button"
                    onClick={() => setChartModal({ code: item.stock_code ?? '', name: stock })}
                    className="text-xs bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 px-2 py-0.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer font-medium"
                    title={`${stock} 차트 보기`}
                  >
                    {stock} ▶
                  </button>
                ))}
              </div>
            )}

            {/* 하단 메타 정보 */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-auto pt-1">
              {item.source && <span>{item.source}</span>}
              {item.source && item.published_at && <span>·</span>}
              {item.published_at && (
                <span>{new Date(item.published_at).toLocaleDateString('ko-KR')}</span>
              )}
              <AiBadge label="반디" source={item.source_url ?? undefined} />
            </div>
          </div>

          {/* 3. 우측 신호 패널 (영향도 신호등) */}
          <div className={`flex-shrink-0 w-20 flex flex-col items-center justify-center gap-1.5 px-2 py-4 ${sig.panel}`}>
            {/* 영향도 점수 (크게) */}
            <span className={`text-2xl font-black tabular-nums leading-none ${sig.score}`}>
              {item.impact_score}
            </span>

            {/* 신호 텍스트 */}
            <span className={`text-sm font-bold ${sig.label}`}>
              {sig.text}
            </span>

            {/* 세로 진행 바 */}
            <div className="w-4 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden relative mt-1">
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-full ${impactBarColor(item.impact_score)} transition-all`}
                style={{ height: `${item.impact_score}%` }}
              />
            </div>

            {/* 신뢰도 표시 */}
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
              신뢰 {item.confidence}%
            </span>
          </div>
        </div>
      </article>

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
