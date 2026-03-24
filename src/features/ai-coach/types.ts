/** AI 코치 "반디" 기능 타입 정의 */

/** 채팅 메시지 인터페이스 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source_urls?: string[];
  disclaimer?: string;
  /** AI 응답 여부 플래그 — AiBadge 표시에 사용 */
  isAi?: boolean;
  timestamp: Date;
}

/** 빠른 질문 목록 */
export const QUICK_QUESTIONS = [
  '삼성전자 지금 사도 될까요?',
  '배당주 투자 어떻게 시작하나요?',
  '요즘 시장 어때요?',
  '분산 투자가 뭔가요?',
] as const;
