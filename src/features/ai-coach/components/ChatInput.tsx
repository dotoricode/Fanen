'use client';

/**
 * AI 코치 채팅 입력 컴포넌트
 * - Enter 키: 전송 / Shift+Enter: 줄바꿈
 * - 전송 버튼: 파란색 화살표 아이콘
 */
import { useState, useRef, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';

/** ChatInput Props */
interface ChatInputProps {
  /** 전송 핸들러 */
  onSend: (message: string) => void;
  /** 비활성화 여부 (로딩 중) */
  disabled: boolean;
}

/** 채팅 텍스트 입력 + 전송 컴포넌트 */
export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showVoiceGate, setShowVoiceGate] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isPremium } = useSubscription();
  const router = useRouter();

  /** 전송 처리 */
  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // textarea 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  /** Enter=전송, Shift+Enter=줄바꿈 */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** textarea 자동 높이 조정 */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const canSend = value.trim().length > 0 && !disabled;

  /** 음성 입력 버튼 클릭 처리 */
  const handleVoiceClick = () => {
    if (!isPremium) {
      setShowVoiceGate(true);
      return;
    }
    // Premium 사용자: 향후 Whisper API 연동 예정
  };

  return (
    <div className="relative">
      {/* Premium 기능 안내 모달 */}
      {showVoiceGate && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-lg">
          <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">Premium 기능입니다</p>
          <p className="mb-3 text-xs text-gray-500 dark:text-zinc-500">
            음성 입력은 Premium 플랜에서 사용할 수 있습니다.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              업그레이드하기
            </button>
            <button
              type="button"
              onClick={() => setShowVoiceGate(false)}
              className="rounded-lg px-4 py-1.5 text-xs text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}

    <div className="flex items-end gap-2 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
      {/* 음성 입력 버튼 (마이크 아이콘) */}
      <button
        type="button"
        onClick={handleVoiceClick}
        aria-label="음성 입력"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 dark:text-zinc-500 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-600 dark:hover:text-slate-300"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="1" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="반디에게 투자 질문을 입력하세요…"
        rows={1}
        className="max-h-40 flex-1 resize-none bg-transparent text-sm leading-relaxed text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none disabled:opacity-50"
        aria-label="채팅 입력"
      />

      {/* 전송 버튼 */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label="메시지 전송"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
          canSend
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-500 cursor-not-allowed'
        }`}
      >
        {/* 위쪽 화살표 아이콘 */}
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
    </div>
  );
}
