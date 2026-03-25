'use client';

/**
 * 포트폴리오 목록 컴포넌트
 * usePortfolios 훅을 사용해 CRUD 처리
 */
import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { usePortfolios } from '../hooks/usePortfolios';
import type { PortfolioRow } from '../types';
import PortfolioCard from './PortfolioCard';
import PortfolioForm from './PortfolioForm';

export default function PortfolioList() {
  const { portfolios, loading, error, createPortfolio, updatePortfolio, deletePortfolio } =
    usePortfolios();

  /** 폼 표시 여부 */
  const [showForm, setShowForm] = useState(false);
  /** 수정 대상 포트폴리오 (null이면 신규 생성) */
  const [editTarget, setEditTarget] = useState<PortfolioRow | null>(null);

  /* Supabase 미설정 안내 */
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
        <p className="text-zinc-500 dark:text-zinc-400">로그인이 필요합니다.</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          포트폴리오 기능을 이용하려면 로그인해주세요.
        </p>
      </div>
    );
  }

  /** 새 포트폴리오 추가 버튼 핸들러 */
  const handleAddClick = () => {
    setEditTarget(null);
    setShowForm(true);
  };

  /** 수정 버튼 핸들러 */
  const handleEdit = (portfolio: PortfolioRow) => {
    setEditTarget(portfolio);
    setShowForm(true);
  };

  /** 폼 닫기 */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  /** 폼 제출 처리 */
  const handleFormSubmit = async (data: {
    name: string;
    description: string;
    total_value: number;
  }) => {
    if (editTarget) {
      await updatePortfolio(editTarget.id, data);
    } else {
      await createPortfolio(data);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">내 포트폴리오</h2>
        <button
          type="button"
          onClick={handleAddClick}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors"
        >
          + 새 포트폴리오 추가
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-4 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg h-24" />
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && !error && portfolios.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-10 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">아직 포트폴리오가 없습니다.</p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            위 버튼을 눌러 첫 포트폴리오를 추가해보세요.
          </p>
        </div>
      )}

      {/* 포트폴리오 카드 목록 */}
      {!loading && portfolios.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onEdit={handleEdit}
              onDelete={deletePortfolio}
            />
          ))}
        </div>
      )}

      {/* 생성/수정 폼 모달 */}
      {showForm && (
        <PortfolioForm
          initial={editTarget}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
