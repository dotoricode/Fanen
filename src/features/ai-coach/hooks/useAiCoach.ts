/**
 * AI 코치 "핀이" 채팅 훅
 * 메시지 상태 관리 및 Railway API 연동
 * 주의: 'use client' 지시어 없음 — 훅은 클라이언트 컴포넌트 내부에서 import
 */
import { useState } from 'react';
import { askCoach } from '@/lib/railway';
import type { ChatMessage } from '../types';

/** 환영 메시지 (초기 상태) */
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '안녕하세요! 저는 AI 투자 코치 핀이입니다. 투자에 관한 궁금한 점을 편하게 물어보세요. 단, 본 내용은 투자 참고자료이며 실제 투자 결정은 신중하게 해주세요.',
  source_urls: [],
  timestamp: new Date(),
};

/** useAiCoach 반환 타입 */
interface UseAiCoachReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (question: string) => Promise<void>;
  clearHistory: () => void;
}

/** AI 코치 채팅 상태 및 동작을 관리하는 훅 */
export function useAiCoach(): UseAiCoachReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 사용자 질문을 전송하고 핀이 응답을 메시지 목록에 추가
   * @param question 사용자 질문 텍스트
   */
  const sendMessage = async (question: string): Promise<void> => {
    if (!question.trim()) return;

    // 1. 사용자 메시지 즉시 추가
    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // 2. Railway API 호출 (금융 수치는 Railway에서만 생성)
      const result = await askCoach({ question: question.trim(), language_level: 'general' });

      // 3. 어시스턴트 응답 메시지 추가
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + Math.random()),
        role: 'assistant',
        content: result.answer,
        source_urls: result.source_urls,
        disclaimer: result.disclaimer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'AI 서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /** 대화 기록을 초기화하고 환영 메시지로 리셋 */
  const clearHistory = (): void => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, clearHistory };
}
