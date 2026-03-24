'use client';

/**
 * AI 코치 "핀이" 채팅 UI 통합 컴포넌트
 * - useAiCoach 훅으로 메시지 상태 관리
 * - DisclaimerBanner 필수 렌더링
 * - 빠른 질문 버튼 (환영 메시지만 있을 때)
 * - 자동 스크롤
 */
import { useEffect, useRef } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import { useAiCoach } from '../hooks/useAiCoach';
import { QUICK_QUESTIONS } from '../types';
import ChatMessageComponent from './ChatMessage';
import ChatInput from './ChatInput';
import { FinniAvatar } from './FinniAvatar';

/** AI 코치 핀이 채팅 통합 컴포넌트 */
export default function AiCoachChat() {
  const { messages, loading, error, sendMessage, clearHistory } = useAiCoach();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** 새 메시지 추가 시 자동 스크롤 */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /** 빠른 질문 버튼 표시 여부: 환영 메시지만 있을 때 */
  const showQuickQuestions = messages.length === 1;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 핀이 SVG 아바타 */}
          <FinniAvatar size={40} mood="happy" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">핀이 (FinAI)</p>
            <p className="text-xs text-gray-500 dark:text-slate-500">AI 투자 코치</p>
          </div>
        </div>

        {/* 대화 초기화 버튼 */}
        {messages.length > 1 && (
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-lg px-3 py-1.5 text-xs text-gray-500 dark:text-slate-500 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-300"
            aria-label="대화 초기화"
          >
            대화 초기화
          </button>
        )}
      </div>

      {/* 면책 고지 배너 — AI 분석 화면 필수 */}
      <div className="px-4 pt-3">
        <DisclaimerBanner variant="signal" />
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ minHeight: '400px', maxHeight: '520px' }}>
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}

          {/* 로딩 인디케이터 */}
          {loading && (
            <ChatMessageComponent
              message={{
                id: 'loading',
                role: 'assistant',
                content: '',
                timestamp: new Date(),
              }}
              isLoading
            />
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* 스크롤 앵커 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 빠른 질문 버튼 — 환영 메시지만 있을 때 표시 */}
      {showQuickQuestions && (
        <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-slate-500">자주 묻는 질문</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={loading}
                className="rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-blue-700 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력창 */}
      <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}
