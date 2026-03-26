/** 섹터 분석 티어 레벨 — 0=중심섹터, 1=연관섹터, 2=기업, 3=공급사 */
export type TierLevel = 0 | 1 | 2 | 3;

/** 반디 매매 시그널 */
export type SignalType = 'buy' | 'wait' | 'watch';

/** 섹터 분석 노드 (개별 종목/섹터) */
export interface ValueChainNode {
  ticker: string;
  name: string;
  /** 0=중심섹터, 1=연관섹터, 2=기업, 3=공급사 */
  tier: TierLevel;
  /** 관계 설명: "메이저" | "직접 납품" | "부품/소재" | "간접 수혜" */
  relationship: string;
  /** 시가배당률 (%) — 선택값 */
  dividendYield?: number;
  /** 반디 한줄 설명 */
  description: string;
  signal: SignalType;
  /** KRX/DART 출처 URL — 필수, 빈 문자열 불가 */
  sourceUrl: string;
}

/** 섹터 분석 전체 데이터 */
export interface ValueChain {
  /** 섹터 키: "defense" | "semiconductor" | "battery" */
  sector: string;
  /** 섹터 한글 레이블: "방산" | "반도체" | "2차전지" */
  sectorLabel: string;
  /** 트리거 이벤트 설명 */
  eventTrigger: string;
  nodes: ValueChainNode[];
  /** ISO 8601 업데이트 시각 */
  updatedAt: string;
}

// API 호환 alias
export type SectorData = ValueChain;
export type SectorNode = ValueChainNode;
