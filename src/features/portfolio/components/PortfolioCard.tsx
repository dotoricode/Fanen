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
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      {/* 포트폴리오명 */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{portfolio.name}</h3>

      {/* 설명 (있으면 표시) */}
      {portfolio.description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">{portfolio.description}</p>
      )}

      {/* 평가금액 */}
      <p className="mt-3 text-2xl font-semibold text-blue-600">
        {formatKRW(portfolio.total_value)}
      </p>

      {/* 종목별 비중 (Mock 데이터) */}
      <div className="mt-3 space-y-2">
        {[
          { name: '삼성전자', weight: 40, color: 'bg-blue-500' },
          { name: 'SK하이닉스', weight: 25, color: 'bg-green-500' },
          { name: 'NAVER', weight: 20, color: 'bg-purple-500' },
          { name: '카카오', weight: 15, color: 'bg-yellow-500' },
        ].map((stock) => (
          <div key={stock.name} className="flex items-center gap-2 text-sm">
            <span className="w-20 text-gray-600 dark:text-zinc-400 truncate">{stock.name}</span>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${stock.color}`}
                style={{ width: `${stock.weight}%` }}
              />
            </div>
            <span className="w-10 text-right text-gray-500 dark:text-zinc-500">{stock.weight}%</span>
          </div>
        ))}
      </div>

      {/* 생성일 */}
      <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
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
