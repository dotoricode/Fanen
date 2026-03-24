'use client';

/**
 * AI 코치 채팅 메시지 말풍선 컴포넌트
 * - user: 오른쪽 정렬 파란색 말풍선
 * - assistant: 왼쪽 정렬 흰색 말풍선 + 핀이 아이콘
 */
import AiBadge from '@/components/common/AiBadge';
import type { ChatMessage as ChatMessageType } from '../types';

/** ChatMessage Props */
interface ChatMessageProps {
  /** 표시할 메시지 데이터 */
  message: ChatMessageType;
  /** 로딩 중 (점 애니메이션) 여부 */
  isLoading?: boolean;
}

/** 개별 채팅 메시지 말풍선 */
export default function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {/* 핀이 아이콘 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        핀
      </div>

      {/* 말풍선 */}
      <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3">
        {isLoading ? (
          /* 로딩 점 애니메이션 */
          <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {message.content}
            </p>

            {/* AI 분석 뱃지 + 출처 URL 목록 */}
            {message.source_urls && message.source_urls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.source_urls.map((url) => (
                  <AiBadge key={url} label="AI 분석" source={url} />
                ))}
              </div>
            )}

            {/* source_urls 없어도 AI 응답이면 뱃지 표시 */}
            {(!message.source_urls || message.source_urls.length === 0) &&
              message.id !== 'welcome' && (
                <div className="mt-2">
                  <AiBadge label="AI 분석" />
                </div>
              )}

            {/* 면책 고지 텍스트 */}
            {message.disclaimer && (
              <p className="mt-2 text-xs leading-relaxed text-gray-400">{message.disclaimer}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
