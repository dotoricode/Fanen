/**
 * useMockAccount 훅
 * 현재 사용자의 활성 시즌 모의투자 계좌를 조회한다.
 * 계좌가 없으면 1,000만원으로 자동 생성한다.
 * — 'use client' 지시어 사용 금지 (훅 파일)
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { MockAccountRow, MockSeasonRow } from '../types';

/** 초기 시드머니 1,000만원 */
const INITIAL_BALANCE = 10_000_000;

interface UseMockAccountReturn {
  account: MockAccountRow | null;
  season: MockSeasonRow | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMockAccount(): UseMockAccountReturn {
  const [account, setAccount] = useState<MockAccountRow | null>(null);
  const [season, setSeason] = useState<MockSeasonRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** 활성 시즌 계좌 조회. 계좌가 없으면 자동 생성 */
  const fetchOrCreate = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setAccount(null);
      setSeason(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setAccount(null);
      setSeason(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 현재 로그인 사용자 확인
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setAccount(null);
        setSeason(null);
        setLoading(false);
        return;
      }

      // 활성 시즌 조회
      const { data: seasonData, error: seasonError } = await (supabase as any)
        .from('mock_seasons')
        .select('*')
        .eq('is_active', true)
        .single();

      if (seasonError || !seasonData) {
        // 활성 시즌이 없으면 null로 처리 (graceful degradation)
        setAccount(null);
        setSeason(null);
        setLoading(false);
        return;
      }

      const activeSeason = seasonData as MockSeasonRow;
      setSeason(activeSeason);

      // 해당 시즌의 사용자 계좌 조회
      const { data: accountData, error: accountError } = await (supabase as any)
        .from('mock_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('season_id', activeSeason.id)
        .single();

      if (accountError && accountError.code !== 'PGRST116') {
        // PGRST116 = row not found (계좌 없음)
        setError(accountError.message);
        setLoading(false);
        return;
      }

      if (accountData) {
        // 기존 계좌 사용
        setAccount(accountData as MockAccountRow);
      } else {
        // 계좌 자동 생성
        const { data: newAccount, error: insertError } = await (supabase as any)
          .from('mock_accounts')
          .insert({
            user_id: user.id,
            season_id: activeSeason.id,
            initial_balance: INITIAL_BALANCE,
            current_balance: INITIAL_BALANCE,
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError.message);
        } else {
          setAccount(newAccount as MockAccountRow);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '계좌 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrCreate();
  }, [fetchOrCreate]);

  return { account, season, loading, error, refetch: fetchOrCreate };
}
