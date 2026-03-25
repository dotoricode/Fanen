'use client';

/**
 * MockRankingBoard
 * 활성 시즌 모의투자 랭킹 보드 (다크모드 지원)
 * - Top 3 메달 이모지 표시
 * - 내 랭킹 행 하이라이트
 */
import { useMockAccount } from '../hooks/useMockAccount';
import { useMockRanking } from '../hooks/useMockRanking';

/** 순위에 따른 메달 이모지 반환 */
function getMedalEmoji(rank: number | null): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
}

/** 랭킹 변동 표시 컴포넌트 (Mock: 순위 기반 시뮬레이션) */
function RankChangeIndicator({ rank }: { rank: number | null }) {
  if (rank === null) return null;
  // Mock 변동값: 짝수 순위는 상승, 3의 배수는 하락, 나머지는 변동 없음
  const mockChange = rank % 3 === 0 ? -(Math.floor(rank / 3)) : rank % 2 === 0 ? Math.ceil(rank / 4) : 0;

  if (mockChange > 0) {
    return <span className="text-xs font-medium text-green-600 ml-1">▲{mockChange}</span>;
  }
  if (mockChange < 0) {
    return <span className="text-xs font-medium text-red-600 ml-1">▼{Math.abs(mockChange)}</span>;
  }
  return <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 ml-1">-</span>;
}

export default function MockRankingBoard() {
  const { season } = useMockAccount();
  const { rankings, loading, error, currentUserRank } = useMockRanking(season?.id);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4">랭킹</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded bg-gray-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">랭킹</h2>
        <p className="text-sm text-red-600">오류: {error}</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-4">랭킹</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-8">
          아직 랭킹 데이터가 없습니다.
          <br />
          모의투자에 참여하여 순위에 도전해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">랭킹</h2>
        {currentUserRank && (
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            내 순위:{' '}
            <span className="font-semibold text-blue-600">
              {currentUserRank.rank ?? '-'}위
            </span>
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-700">
              <th className="pb-2 text-center font-medium text-gray-500 dark:text-zinc-400 w-16">순위</th>
              <th className="pb-2 text-center font-medium text-gray-500 dark:text-zinc-400 w-16">변동</th>
              <th className="pb-2 text-left font-medium text-gray-500 dark:text-zinc-400">닉네임</th>
              <th className="pb-2 text-right font-medium text-gray-500 dark:text-zinc-400">수익률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {rankings.map((item) => {
              const isMe = item.user_id === currentUserRank?.user_id;
              const profitRate = item.profit_rate ?? 0;
              const isPositive = profitRate >= 0;
              const medal = getMedalEmoji(item.rank);

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isMe
                      ? 'bg-blue-50 dark:bg-blue-950/40'
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <td className="py-3 text-center">
                    <span className="font-bold text-gray-900 dark:text-zinc-100">
                      {medal ? (
                        <span className="text-lg">{medal}</span>
                      ) : (
                        <span>{item.rank ?? '-'}</span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <RankChangeIndicator rank={item.rank} />
                  </td>
                  <td className="py-3">
                    <span className={`font-medium ${isMe ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-zinc-100'}`}>
                      {item.nickname ?? '익명'}
                    </span>
                    {isMe && (
                      <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 font-medium">(나)</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {isPositive ? '+' : ''}
                      {profitRate.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
