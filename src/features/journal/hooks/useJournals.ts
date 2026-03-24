/**
 * 투자 일지 CRUD 훅
 * 'use client' 없음 — 이 파일은 훅 구현만 담당, 클라이언트 컴포넌트에서 import
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { TradeJournalRow, EmotionType } from '../types';

/** createJournal 입력 데이터 타입 */
interface CreateJournalData {
  stock_code?: string;
  stock_name?: string;
  note: string;
  emotion: EmotionType;
}

/** useJournals 훅 반환 타입 */
interface UseJournalsReturn {
  journals: TradeJournalRow[];
  loading: boolean;
  error: string | null;
  createJournal: (data: CreateJournalData) => Promise<void>;
  updateJournal: (id: string, data: Partial<{ note: string; emotion: EmotionType }>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
}

/** 투자 일지 CRUD 훅 — 현재 사용자의 최신 20건 관리 */
export function useJournals(): UseJournalsReturn {
  const [journals, setJournals] = useState<TradeJournalRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** 일지 목록 조회 */
  const fetchJournals = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setJournals([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await (supabase as any)
        .from('trade_journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        setError('일지를 불러오는 중 오류가 발생했습니다.');
      } else {
        setJournals((data as TradeJournalRow[]) ?? []);
      }
    } catch {
      setError('일지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchJournals();
  }, [fetchJournals]);

  /** 새 일지 생성 */
  const createJournal = useCallback(async (data: CreateJournalData): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: insertError } = await (supabase as any)
      .from('trade_journals')
      .insert({
        user_id: user.id,
        stock_code: data.stock_code ?? null,
        stock_name: data.stock_name ?? null,
        note: data.note,
        emotion: data.emotion,
      });

    if (insertError) {
      throw new Error('일지 저장에 실패했습니다.');
    }

    await fetchJournals();
  }, [fetchJournals]);

  /** 일지 수정 */
  const updateJournal = useCallback(
    async (id: string, data: Partial<{ note: string; emotion: EmotionType }>): Promise<void> => {
      if (!isSupabaseConfigured()) return;

      const supabase = createClient();
      if (!supabase) return;

      const { error: updateError } = await (supabase as any)
        .from('trade_journals')
        .update(data)
        .eq('id', id);

      if (updateError) {
        throw new Error('일지 수정에 실패했습니다.');
      }

      await fetchJournals();
    },
    [fetchJournals],
  );

  /** 일지 삭제 */
  const deleteJournal = useCallback(async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    if (!supabase) return;

    const { error: deleteError } = await (supabase as any)
      .from('trade_journals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error('일지 삭제에 실패했습니다.');
    }

    setJournals((prev) => prev.filter((j) => j.id !== id));
  }, []);

  return { journals, loading, error, createJournal, updateJournal, deleteJournal };
}
