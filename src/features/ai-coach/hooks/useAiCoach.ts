/**
 * AI 코치 "반디" 채팅 훅
 * 메시지 상태 관리, localStorage 히스토리 저장, Railway API / Mock 분기
 * 주의: 'use client' 지시어 없음 — 훅은 클라이언트 컴포넌트 내부에서 import
 */
import { useState, useEffect, useCallback } from 'react';
import { askCoach } from '@/lib/railway';
import { USE_MOCK } from '@/lib/mock';
import { mockAskCoach } from './mockCoach';
import type { ChatMessage } from '../types';

/** localStorage 키 */
const STORAGE_KEY = 'fanen-coach-history';

/** 환영 메시지 (초기 상태) */
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '안녕하세요! 저는 AI 투자 코치 반디입니다. 투자에 관한 궁금한 점을 편하게 물어보세요. 단, 본 내용은 투자 참고자료이며 실제 투자 결정은 신중하게 해주세요.',
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

  /** localStorage에서 히스토리 복원 */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // localStorage 파싱 오류 시 기본 상태 유지
    }
  }, []);

  /** 메시지 변경 시 localStorage에 저장 */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // localStorage 쓰기 실패 시 무시
    }
  }, [messages]);

  /**
   * 사용자 질문을 전송하고 반디 응답을 메시지 목록에 추가
   * Mock 모드: mockAskCoach로 1.5초 지연 후 랜덤 응답
   * 실 환경: Railway API 호출
   */
  const sendMessage = useCallback(async (question: string): Promise<void> => {
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
      // 2. Mock / Railway API 분기
      const result = USE_MOCK
        ? await mockAskCoach({ question: question.trim() })
        : await askCoach({ question: question.trim(), language_level: 'general' });

      // 3. 어시스턴트 응답 메시지 추가 (isAi 플래그 포함)
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + Math.random()),
        role: 'assistant',
        content: result.answer,
        source_urls: result.source_urls,
        disclaimer: result.disclaimer,
        isAi: true,
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
  }, []);

  /** 대화 기록을 초기화하고 환영 메시지로 리셋 */
  const clearHistory = useCallback((): void => {
    const freshWelcome = {
      ...WELCOME_MESSAGE,
      timestamp: new Date(),
    };
    setMessages([freshWelcome]);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage 삭제 실패 시 무시
    }
  }, []);

  return { messages, loading, error, sendMessage, clearHistory };
}
