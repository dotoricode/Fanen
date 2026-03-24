'use client';

/**
 * 투자 일지 카드 컴포넌트
 * 개별 일지 항목을 카드 형태로 표시
 */
import { AiBadge } from '@/components/common';
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
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* 상단 헤더: 날짜 + 감정 + 버튼 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 날짜 */}
          <time
            dateTime={journal.created_at}
            className="text-sm text-gray-500"
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
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              {journal.stock_name}
              {journal.stock_code && (
                <span className="ml-1 text-gray-400">({journal.stock_code})</span>
              )}
            </span>
          )}
        </div>

        {/* 수정/삭제 버튼 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(journal)}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="일지 수정"
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            aria-label="일지 삭제"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 노트 내용 */}
      {journal.note && (
        <p className="mt-3 text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">
          {journal.note}
        </p>
      )}

      {/* AI 피드백 (있는 경우만 표시) */}
      {journal.ai_feedback && (
        <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-3">
          <div className="mb-1.5">
            <AiBadge label="핀이 분석" />
          </div>
          <p className="text-sm text-blue-800">{journal.ai_feedback}</p>
        </div>
      )}
    </article>
  );
}
