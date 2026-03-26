/**
 * sector-analysis feature — public exports
 */

// 훅
export { useSectorAnalysis } from './hooks/useSectorAnalysis';

// 컴포넌트
export { SectorMindmapView } from './components/SectorMindmapView';
export { SectorDetailPanel } from './components/SectorDetailPanel';
export { ValueChainDiagram } from './components/ValueChainDiagram';

// 타입
export type { ValueChain, ValueChainNode, TierLevel, SignalType, SectorData, SectorNode } from './types';

// mock 데이터 (개발·테스트 용도)
export { mockSectorData } from './mock/mockSectorData';
