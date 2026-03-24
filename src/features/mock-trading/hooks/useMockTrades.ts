/**
 * useMockTrades 훅
 * 거래 내역 조회 및 매수/매도 실행을 담당한다.
 * — 'use client' 지시어 사용 금지 (훅 파일)
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { MockTradeRow } from '../types';

/** 거래 실행 파라미터 */
interface ExecuteTradeParams {
  account_id: string;
  stock_code: string;
  stock_name: string;
  trade_type: 'buy' | 'sell';
  quantity: number;
  price: number;
}

interface UseMockTradesReturn {
  trades: MockTradeRow[];
  loading: boolean;
  error: string | null;
  executing: boolean;
  executeTrade: (params: ExecuteTradeParams) => Promise<boolean>;
  refetchTrades: () => Promise<void>;
}

export function useMockTrades(): UseMockTradesReturn {
  const [trades, setTrades] = useState<MockTradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  /** 현재 사용자의 최신 거래 내역 20건 조회 */
  const fetchTrades = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setTrades([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setTrades([]);
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
        setTrades([]);
        setLoading(false);
        return;
      }

      const { data: rows, error: supabaseError } = await (supabase as any)
        .from('mock_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('traded_at', { ascending: false })
        .limit(20);

      if (supabaseError) {
        setError(supabaseError.message);
      } else {
        setTrades((rows as MockTradeRow[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '거래 내역 로드 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  /**
   * 매수/매도 거래 실행
   * 매수 시 잔고 확인 → 거래 기록 → 잔고 업데이트
   * @returns 성공 여부
   */
  const executeTrade = useCallback(
    async (params: ExecuteTradeParams): Promise<boolean> => {
      if (!isSupabaseConfigured()) return false;

      const supabase = createClient();
      if (!supabase) return false;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('로그인이 필요합니다');
        return false;
      }

      setExecuting(true);
      setError(null);

      try {
        const totalAmount = params.quantity * params.price;

        // 매수 시 잔고 체크
        if (params.trade_type === 'buy') {
          const { data: accountData, error: accountError } = await (supabase as any)
            .from('mock_accounts')
            .select('current_balance')
            .eq('id', params.account_id)
            .single();

          if (accountError || !accountData) {
            setError('계좌 정보를 불러올 수 없습니다');
            return false;
          }

          if ((accountData as { current_balance: number }).current_balance < totalAmount) {
            setError('잔고가 부족합니다');
            return false;
          }
        }

        // 거래 내역 insert
        const { error: insertError } = await (supabase as any)
          .from('mock_trades')
          .insert({
            account_id: params.account_id,
            user_id: user.id,
            stock_code: params.stock_code,
            stock_name: params.stock_name,
            trade_type: params.trade_type,
            quantity: params.quantity,
            price: params.price,
          });

        if (insertError) {
          setError(insertError.message);
          return false;
        }

        // 잔고 업데이트: 매수 → 차감, 매도 → 증가
        const { data: currentAccount, error: balanceFetchError } = await (supabase as any)
          .from('mock_accounts')
          .select('current_balance')
          .eq('id', params.account_id)
          .single();

        if (balanceFetchError || !currentAccount) {
          setError('잔고 업데이트 중 오류가 발생했습니다');
          return false;
        }

        const prevBalance = (currentAccount as { current_balance: number }).current_balance;
        const newBalance =
          params.trade_type === 'buy' ? prevBalance - totalAmount : prevBalance + totalAmount;

        const { error: updateError } = await (supabase as any)
          .from('mock_accounts')
          .update({ current_balance: newBalance })
          .eq('id', params.account_id);

        if (updateError) {
          setError(updateError.message);
          return false;
        }

        // 거래 목록 갱신
        await fetchTrades();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : '거래 실행 실패');
        return false;
      } finally {
        setExecuting(false);
      }
    },
    [fetchTrades],
  );

  return { trades, loading, error, executing, executeTrade, refetchTrades: fetchTrades };
}
