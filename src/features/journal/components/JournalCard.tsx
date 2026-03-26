'use client';

/**
 * 투자 일지 카드 컴포넌트
 * 개별 일지 항목을 카드 형태로 표시
 */
import AiBadge from '@/components/common/AiBadge';
import { getEmotionConfig } from '../types';
import type { TradeJournalRow } from '../types';

interface JournalCardProps {
  journal: TradeJournalRow;
  onEdit: (journal: TradeJournalRow) => void;
  onDelete: (id: string) => void;
}

/** 날짜를 한국어 로케일로 포맷 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

/** 투자 일지 카드 */
export default function JournalCard({ journal, onEdit, onDelete }: JournalCardProps) {
  const emotionConfig = getEmotionConfig(journal.emotion);

  const handleDelete = () => {
    if (window.confirm('이 일지를 삭제하시겠습니까?')) {
      onDelete(journal.id);
    }
  };

  return (
    <article className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      {/* 상단 헤더: 날짜 + 감정 + 버튼 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 날짜 */}
          <time
            dateTime={journal.created_at}
            className="text-sm text-zinc-500 dark:text-zinc-400"
          >
            {formatDate(journal.created_at)}
          </time>

          {/* 감정 뱃지 */}
          <span className={`inline-flex items-center gap-1 text-sm font-medium ${emotionConfig.color}`}>
            <span aria-label={emotionConfig.label}>{emotionConfig.emoji}</span>
            <span>{emotionConfig.label}</span>
          </span>

          {/* 종목명 */}
          {journal.stock_name && (
            <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {journal.stock_name}
              {journal.stock_code && (
                <span className="ml-1 text-zinc-400 dark:text-zinc-500">({journal.stock_code})</span>
              )}
            </span>
          )}
        </div>

        {/* 수정/삭제 버튼 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(journal)}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            aria-label="일지 수정"
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            aria-label="일지 삭제"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 노트 내용 */}
      {journal.note && (
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3 whitespace-pre-wrap">
          {journal.note}
        </p>
      )}

      {/* AI 피드백 — 완전 무료 */}
      {journal.ai_feedback && (
        <div className="mt-3 rounded-md border border-teal-100 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-950/20 p-3">
          <div className="mb-1.5">
            <AiBadge label="반디 분석" />
          </div>
          <p className="text-sm text-teal-800 dark:text-teal-300">{journal.ai_feedback}</p>
        </div>
      )}
    </article>
  );
}
