'use client';

/**
 * 투자 일지 목록 컴포넌트
 * useJournals 훅을 사용해 CRUD 기능을 제공
 */
import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useJournals } from '../hooks/useJournals';
import JournalCard from './JournalCard';
import JournalForm from './JournalForm';
import type { TradeJournalRow, EmotionType } from '../types';
import { EMOTION_CONFIG } from '../types';

/** 감정 필터 옵션 */
const EMOTION_FILTERS: { key: EmotionType | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'excited', label: `낙관 ${EMOTION_CONFIG.excited.emoji}` },
  { key: 'neutral', label: `중립 ${EMOTION_CONFIG.neutral.emoji}` },
  { key: 'anxious', label: `불안 ${EMOTION_CONFIG.anxious.emoji}` },
  { key: 'regret', label: `후회 ${EMOTION_CONFIG.regret.emoji}` },
];

/** 스켈레톤 로딩 카드 */
function SkeletonCard() {
  return <div className="animate-pulse bg-gray-100 dark:bg-zinc-800 rounded-lg h-24" aria-hidden="true" />;
}

/** 투자 일지 목록 (생성/수정/삭제 포함) */
export default function JournalList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<TradeJournalRow | null>(null);
  const [emotionFilter, setEmotionFilter] = useState<EmotionType | 'all'>('all');

  const { journals, loading, error, createJournal, updateJournal, deleteJournal } = useJournals();

  /** Supabase 미설정 시 안내 */
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
        <p className="text-gray-500 dark:text-zinc-500">로그인이 필요합니다.</p>
        <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">투자 일지를 작성하려면 먼저 로그인해 주세요.</p>
      </div>
    );
  }

  /** 새 일지 저장 */
  const handleCreate = async (data: {
    stock_code?: string;
    stock_name?: string;
    note: string;
    emotion: EmotionType;
  }) => {
    await createJournal(data);
  };

  /** 일지 수정 저장 */
  const handleUpdate = async (data: {
    stock_code?: string;
    stock_name?: string;
    note: string;
    emotion: EmotionType;
  }) => {
    if (!editingJournal) return;
    await updateJournal(editingJournal.id, { note: data.note, emotion: data.emotion });
  };

  /** 수정 모달 열기 */
  const handleEdit = (journal: TradeJournalRow) => {
    setEditingJournal(journal);
    setIsFormOpen(true);
  };

  /** 폼 닫기 */
  const handleClose = () => {
    setIsFormOpen(false);
    setEditingJournal(null);
  };

  /** 새 일지 작성 버튼 클릭 */
  const handleNewJournal = () => {
    setEditingJournal(null);
    setIsFormOpen(true);
  };

  return (
    <section>
      {/* 목록 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">투자 일지</h2>
        <button
          type="button"
          onClick={handleNewJournal}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          새 일지 작성
        </button>
      </div>

      {/* 감정 태그 필터 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EMOTION_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setEmotionFilter(filter.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              emotionFilter === filter.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="space-y-4" aria-label="일지 로딩 중">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* 에러 상태 */}
      {!loading && error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && !error && journals.length === 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
          <p className="text-gray-500 dark:text-zinc-500">아직 작성된 일지가 없습니다.</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
            투자 기록과 감정을 남기고 성장 과정을 돌아보세요.
          </p>
          <button
            type="button"
            onClick={handleNewJournal}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            첫 일지 작성하기
          </button>
        </div>
      )}

      {/* 일지 목록 */}
      {!loading && !error && journals.length > 0 && (() => {
        const filtered = emotionFilter === 'all'
          ? journals
          : journals.filter((j) => j.emotion === emotionFilter);
        return filtered.length > 0 ? (
          <ul className="space-y-4" aria-label="투자 일지 목록">
            {filtered.map((journal) => (
              <li key={journal.id}>
                <JournalCard
                  journal={journal}
                  onEdit={handleEdit}
                  onDelete={deleteJournal}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
            <p className="text-gray-500 dark:text-zinc-500">해당 감정의 일지가 없습니다.</p>
          </div>
        );
      })()}

      {/* 생성/수정 폼 모달 */}
      {isFormOpen && (
        <JournalForm
          initial={editingJournal}
          onSubmit={editingJournal ? handleUpdate : handleCreate}
          onClose={handleClose}
        />
      )}
    </section>
  );
}
