'use client';

/**
 * AI 코치 채팅 입력 컴포넌트
 * - Enter 키: 전송 / Shift+Enter: 줄바꿈
 * - 전송 버튼: 파란색 화살표 아이콘
 */
import { useState, useRef, type KeyboardEvent } from 'react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="핀이에게 투자 질문을 입력하세요…"
        rows={1}
        className="max-h-40 flex-1 resize-none bg-transparent text-sm leading-relaxed text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
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
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
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
  );
}
