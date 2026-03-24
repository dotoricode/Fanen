/**
 * useMockRanking 훅
 * 활성 시즌의 모의투자 랭킹 상위 20건을 조회한다.
 * — 'use client' 지시어 사용 금지 (훅 파일)
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { MockRankingRow } from '../types';

interface UseMockRankingReturn {
  rankings: MockRankingRow[];
  loading: boolean;
  error: string | null;
  currentUserRank: MockRankingRow | null;
}

export function useMockRanking(seasonId: string | null | undefined): UseMockRankingReturn {
  const [rankings, setRankings] = useState<MockRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<MockRankingRow | null>(null);

  /** 활성 시즌 랭킹 상위 20건 조회 */
  const fetchRankings = useCallback(async () => {
    if (!seasonId) {
      setRankings([]);
      setCurrentUserRank(null);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setRankings([]);
      setCurrentUserRank(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setRankings([]);
      setCurrentUserRank(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 현재 로그인 사용자 확인 (내 랭킹 하이라이트용)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 랭킹 상위 20건 조회 (rank ASC)
      const { data: rows, error: supabaseError } = await (supabase as any)
        .from('mock_rankings')
        .select('*')
        .eq('season_id', seasonId)
        .order('rank', { ascending: true })
        .limit(20);

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      const rankList = (rows as MockRankingRow[]) ?? [];
      setRankings(rankList);

      // 현재 사용자의 랭킹 추출
      if (user) {
        const myRank = rankList.find((r) => r.user_id === user.id) ?? null;
        setCurrentUserRank(myRank);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '랭킹 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, loading, error, currentUserRank };
}
