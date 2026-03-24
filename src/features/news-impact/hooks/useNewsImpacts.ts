'use client';

/**
 * useNewsImpacts 훅
 * Supabase에서 뉴스 임팩트 데이터를 조회하고 Railway AI 분석 결과를 병합
 */
import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { analyzeNews } from '@/lib/railway';
import type { Database } from '@/types/database.types';
import type { NewsImpactCardData } from '../types';
import { scoreToSignal, splitSummary } from '../types';

type NewsImpactRow = Database['public']['Tables']['news_impacts']['Row'];

interface UseNewsImpactsReturn {
  data: NewsImpactCardData[];
  loading: boolean;
  error: string | null;
}

export function useNewsImpacts(): UseNewsImpactsReturn {
  const [data, setData] = useState<NewsImpactCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Supabase 설정 여부 확인
      if (!isSupabaseConfigured()) {
        setData([]);
        setLoading(false);
        return;
      }

      // Supabase 클라이언트 생성
      const supabase = createClient();
      if (!supabase) {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        // news_impacts 테이블에서 최신 20건 조회
        const { data: rawRows, error: supabaseError } = await supabase
          .from('news_impacts')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(20);
        const rows = rawRows as NewsImpactRow[] | null;

        if (supabaseError) {
          setError(supabaseError.message);
          setLoading(false);
          return;
        }

        const supabaseRows = rows ?? [];

        // Supabase Row → NewsImpactCardData 변환 (1차 렌더링)
        const initialData: NewsImpactCardData[] = supabaseRows.map((row) => {
          const impact_score = row.impact_score ?? 50;
          const { general, expert } = splitSummary(row.ai_summary);
          return {
            id: String(row.id),
            headline: row.headline,
            source: row.source ?? null,
            published_at: row.published_at ?? null,
            impact_score,
            signal: scoreToSignal(impact_score),
            confidence: impact_score,
            affected_sectors: row.affected_sectors ?? [],
            affected_stocks: row.affected_stocks ?? [],
            ai_summary_general: general,
            ai_summary_expert: expert,
            source_url: null, // Railway 응답 후 업데이트 예정
          };
        });

        setData(initialData);
        setLoading(false);

        // Railway analyzeNews 비동기 호출 (폴백 — 실패해도 UI 유지)
        if (supabaseRows.length > 0) {
          try {
            const railwayResponse = await analyzeNews({
              headlines: supabaseRows.map((r) => ({
                headline: r.headline,
                source: r.source,
                published_at: r.published_at,
              })),
            });

            // Railway 응답의 source_url을 기존 카드 데이터에 병합
            if (railwayResponse?.results) {
              setData((prev) =>
                prev.map((card, idx) => ({
                  ...card,
                  source_url: railwayResponse.results[idx]?.source_url ?? card.source_url,
                }))
              );
            }
          } catch (railwayErr) {
            // Railway 실패 시 Supabase 데이터 유지 (에러 상태 미설정)
            console.warn('[useNewsImpacts] Railway API 호출 실패 (Supabase 데이터로 폴백):', railwayErr);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
