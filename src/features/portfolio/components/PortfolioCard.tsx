'use client';

/**
 * 포트폴리오 카드 컴포넌트
 * 이름, 설명, 평가금액, 생성일 표시 + 수정/삭제 액션
 */
import type { PortfolioRow } from '../types';
import { formatKRW } from '../types';

interface PortfolioCardProps {
  portfolio: PortfolioRow;
  onEdit: (portfolio: PortfolioRow) => void;
  onDelete: (id: string) => void;
}

/** 날짜 문자열을 한국어 형식으로 포맷 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PortfolioCard({ portfolio, onEdit, onDelete }: PortfolioCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* 포트폴리오명 */}
      <h3 className="text-lg font-bold text-gray-900">{portfolio.name}</h3>

      {/* 설명 (있으면 표시) */}
      {portfolio.description && (
        <p className="mt-1 text-sm text-gray-500">{portfolio.description}</p>
      )}

      {/* 평가금액 */}
      <p className="mt-3 text-2xl font-semibold text-blue-600">
        {formatKRW(portfolio.total_value)}
      </p>

      {/* 생성일 */}
      <p className="mt-1 text-xs text-gray-400">
        생성일: {formatDate(portfolio.created_at)}
      </p>

      {/* 액션 버튼 */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(portfolio)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => onDelete(portfolio.id)}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
