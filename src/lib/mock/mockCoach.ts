/**
 * Mock AI 코치 반디 대화 히스토리 — 3세트
 * ChatMessage 타입 준수
 * AI가 생성한 금융 수치가 아닌, 일반적인 투자 교육 내용
 */
import type { ChatMessage } from '@/features/ai-coach/types';

/** 대화 세트 1: 분산 투자 질문 */
export const MOCK_COACH_HISTORY_1: ChatMessage[] = [
  {
    id: 'mock-coach-1-q',
    role: 'user',
    content: '분산 투자가 뭔가요?',
    timestamp: new Date('2026-03-20T10:00:00Z'),
  },
  {
    id: 'mock-coach-1-a',
    role: 'assistant',
    content:
      '분산 투자란 하나의 종목이나 자산에 집중하지 않고, 여러 종목·업종·자산군에 나누어 투자하는 전략입니다. "달걀을 한 바구니에 담지 말라"는 격언과 같은 원리예요. 특정 종목이 하락해도 다른 종목이 이를 보완할 수 있어 전체 포트폴리오의 위험을 줄일 수 있습니다.',
    source_urls: [],
    disclaimer: '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다',
    timestamp: new Date('2026-03-20T10:00:05Z'),
  },
];

/** 대화 세트 2: 배당주 투자 질문 */
export const MOCK_COACH_HISTORY_2: ChatMessage[] = [
  {
    id: 'mock-coach-2-q',
    role: 'user',
    content: '배당주 투자 어떻게 시작하나요?',
    timestamp: new Date('2026-03-21T14:00:00Z'),
  },
  {
    id: 'mock-coach-2-a',
    role: 'assistant',
    content:
      '배당주 투자를 시작하려면 먼저 배당 수익률이 안정적인 기업을 찾아보세요. 금융주(은행·보험)나 통신주가 대표적인 고배당 업종입니다. 배당락일 전에 매수해야 배당을 받을 수 있으며, BINAH의 배당 허브 기능에서 주요 종목의 배당 일정을 확인할 수 있습니다. 처음에는 소액으로 시작하여 배당 재투자 효과를 체감해 보시길 권합니다.',
    source_urls: [],
    disclaimer: '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다',
    timestamp: new Date('2026-03-21T14:00:05Z'),
  },
];

/** 대화 세트 3: 시장 상황 질문 */
export const MOCK_COACH_HISTORY_3: ChatMessage[] = [
  {
    id: 'mock-coach-3-q',
    role: 'user',
    content: '요즘 시장 어때요?',
    timestamp: new Date('2026-03-22T09:00:00Z'),
  },
  {
    id: 'mock-coach-3-a',
    role: 'assistant',
    content:
      '현재 시장 상황은 BINAH의 뉴스 분석 분석과 섹터 맵에서 실시간으로 확인하실 수 있습니다. AI 반도체 수요, 방산 수출 호조 등의 호재와 전기차 수요 둔화, 환율 변동 등의 변수가 동시에 작용하고 있는 상황입니다. 투자 결정 전에 반드시 다양한 지표를 종합적으로 검토하시기 바랍니다.',
    source_urls: [],
    disclaimer: '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다',
    timestamp: new Date('2026-03-22T09:00:05Z'),
  },
];

/** 전체 대화 히스토리 (3세트 병합) */
export const MOCK_COACH_HISTORIES: ChatMessage[][] = [
  MOCK_COACH_HISTORY_1,
  MOCK_COACH_HISTORY_2,
  MOCK_COACH_HISTORY_3,
];
