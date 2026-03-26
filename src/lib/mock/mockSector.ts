/**
 * Mock 섹터 인과관계 데이터 — 노드 및 링크
 * D3 ForceSimulation 기반 시각화용
 */
/** sector-map feature 제거 후 로컬 타입 정의 */
interface SectorNode { id: string; name: string; }
interface SectorLink { source: string; target: string; causal_strength: number; description: string; }

/** 섹터 노드 8개 */
export const MOCK_SECTOR_NODES: SectorNode[] = [
  { id: 'semiconductor', name: '반도체' },
  { id: 'bio', name: '바이오' },
  { id: 'finance', name: '금융' },
  { id: 'auto', name: '자동차' },
  { id: 'steel', name: '철강/소재' },
  { id: 'it', name: 'IT/플랫폼' },
  { id: 'defense', name: '방산' },
  { id: 'energy', name: '에너지' },
];

/** 섹터 간 인과관계 링크 10개 */
export const MOCK_SECTOR_LINKS: SectorLink[] = [
  {
    source: 'semiconductor',
    target: 'it',
    causal_strength: 0.85,
    description: '반도체 공급 확대 → IT 기업 원가 절감 효과',
  },
  {
    source: 'semiconductor',
    target: 'auto',
    causal_strength: 0.6,
    description: '차량용 반도체 공급 → 자동차 생산 정상화',
  },
  {
    source: 'energy',
    target: 'steel',
    causal_strength: -0.7,
    description: '에너지 가격 상승 → 철강 제조 원가 증가',
  },
  {
    source: 'finance',
    target: 'bio',
    causal_strength: 0.4,
    description: '금리 인하 → 바이오 성장주 밸류에이션 개선',
  },
  {
    source: 'auto',
    target: 'steel',
    causal_strength: 0.55,
    description: '자동차 생산 증가 → 철강 수요 확대',
  },
  {
    source: 'defense',
    target: 'semiconductor',
    causal_strength: 0.3,
    description: '방산 수출 확대 → 군사용 반도체 수요 증가',
  },
  {
    source: 'it',
    target: 'finance',
    causal_strength: 0.45,
    description: '핀테크 성장 → 금융 디지털 전환 가속',
  },
  {
    source: 'energy',
    target: 'auto',
    causal_strength: -0.5,
    description: '유가 상승 → 내연기관차 수요 감소',
  },
  {
    source: 'bio',
    target: 'it',
    causal_strength: 0.35,
    description: '디지털 헬스케어 → IT 플랫폼 신규 사업 기회',
  },
  {
    source: 'steel',
    target: 'defense',
    causal_strength: 0.5,
    description: '특수강 공급 → 방산 장비 제조 원활화',
  },
];
