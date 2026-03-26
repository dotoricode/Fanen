/**
 * mockSectorData — 섹터 분석 mock 데이터
 * 실제 서비스에서는 Railway FastAPI로 교체 예정
 * 모든 수치·기업명은 정적 상수로만 정의 (AI 직접 생성 금지)
 */
import type { ValueChain } from '../types';

/** KRX 출처 URL placeholder (mock) */
const KRX_URL = 'https://www.krx.co.kr';

export const mockSectorData: Record<string, ValueChain> = {
  /** 방산 섹터 분석 */
  defense: {
    sector: 'defense',
    sectorLabel: '방산',
    eventTrigger: '유럽 재무장 선언 및 한국 방산 수출 호조로 K-방산 섹터 수혜 부각',
    updatedAt: '2026-03-25T09:00:00+09:00',
    nodes: [
      /* T0 — 중심섹터 기업 */
      {
        ticker: '012450',
        name: '한화에어로스페이스',
        tier: 0,
        relationship: '메이저',
        dividendYield: 0.4,
        description: 'K9 자주포·항공엔진 주력, 유럽 수출 계약 최대 수혜주',
        signal: 'buy',
        sourceUrl: KRX_URL,
      },
      {
        ticker: '079550',
        name: 'LIG넥스원',
        tier: 0,
        relationship: '메이저',
        dividendYield: 0.6,
        description: '천궁·비궁 등 유도무기 체계 전문, 중동·유럽 수출 가속화',
        signal: 'buy',
        sourceUrl: KRX_URL,
      },
      /* T1 — 연관섹터/직접납품 */
      {
        ticker: '082740',
        name: '한화엔진',
        tier: 1,
        relationship: '직접 납품',
        dividendYield: 1.2,
        description: '한화에어로스페이스 핵심 엔진 부품 납품, 수주 연동 실적 성장',
        signal: 'watch',
        sourceUrl: KRX_URL,
      },
      {
        ticker: '064960',
        name: 'SNT모티브',
        tier: 1,
        relationship: '직접 납품',
        dividendYield: 2.1,
        description: '소화기·화기 부품 직납, 방산 수출 물량 증가 직접 수혜',
        signal: 'watch',
        sourceUrl: KRX_URL,
      },
      /* T2 — 기업 */
      {
        ticker: '103140',
        name: '풍산',
        tier: 2,
        relationship: '부품/소재',
        dividendYield: 2.8,
        description: '탄약 및 구리 가공 소재, 방산 수요 증가 시 원자재 마진 확대',
        signal: 'watch',
        sourceUrl: KRX_URL,
      },
      {
        ticker: '009830',
        name: '한화솔루션',
        tier: 2,
        relationship: '부품/소재',
        dividendYield: 0.9,
        description: '방산 구조물용 고강도 소재 공급, 그룹 내 수직계열화 수혜',
        signal: 'wait',
        sourceUrl: KRX_URL,
      },
      /* T3 — 공급사/간접수혜 */
      {
        ticker: '047810',
        name: '한국항공우주',
        tier: 3,
        relationship: '간접 수혜',
        dividendYield: 0.3,
        description: 'T-50 훈련기·FA-50 경공격기 수출, 방산 붐 간접 수혜',
        signal: 'wait',
        sourceUrl: KRX_URL,
      },
      {
        ticker: '064350',
        name: '현대로템',
        tier: 3,
        relationship: '간접 수혜',
        dividendYield: 0.5,
        description: 'K2 전차 수출 확대로 방산 성장 모멘텀 공유',
        signal: 'watch',
        sourceUrl: KRX_URL,
      },
    ],
  },

  /** 반도체 섹터 분석 */
  semiconductor: {
    sector: 'semiconductor',
    sectorLabel: '반도체',
    eventTrigger: 'AI 서버 수요 급증 및 HBM 초과 공급 우려 해소로 반도체 섹터 회복 기대',
    updatedAt: '2026-03-25T09:00:00+09:00',
    nodes: [
      { ticker: '005930', name: '삼성전자', tier: 0, relationship: '메이저', dividendYield: 2.5, description: 'DRAM·NAND·파운드리 글로벌 1위, HBM3E 양산 대기', signal: 'watch', sourceUrl: KRX_URL },
      { ticker: '000660', name: 'SK하이닉스', tier: 0, relationship: '메이저', dividendYield: 0.8, description: 'HBM3E 엔비디아 독점 공급, AI 반도체 수혜 핵심주', signal: 'buy', sourceUrl: KRX_URL },
      { ticker: '240810', name: '원익IPS', tier: 1, relationship: '직접 납품', description: 'CVD·ALD 장비 직납, 삼성·SK 투자 확대 연동 수혜', signal: 'watch', sourceUrl: KRX_URL },
      { ticker: '095610', name: '테스', tier: 1, relationship: '직접 납품', description: 'PECVD 장비 전문, 국내 빅2 반도체 캐파 증설 직수혜', signal: 'wait', sourceUrl: KRX_URL },
      { ticker: '357780', name: '솔브레인', tier: 2, relationship: '부품/소재', dividendYield: 1.1, description: '식각액·세정액 소재 공급, 공정 미세화 가속에 따른 수요 증가', signal: 'watch', sourceUrl: KRX_URL },
      { ticker: '005290', name: '동진쎄미켐', tier: 2, relationship: '부품/소재', dividendYield: 1.8, description: '포토레지스트·CMP슬러리 국산화, EUV 공정 소재 수요 증가', signal: 'watch', sourceUrl: KRX_URL },
      { ticker: '039030', name: '이오테크닉스', tier: 3, relationship: '간접 수혜', description: '레이저 마킹·절단 장비, 패키징 공정 고도화 간접 수혜', signal: 'wait', sourceUrl: KRX_URL },
      { ticker: '183300', name: '코미코', tier: 3, relationship: '간접 수혜', description: '반도체 부품 세정·코팅 전문, 가동률 상승 시 매출 연동', signal: 'wait', sourceUrl: KRX_URL },
    ],
  },

  /** 2차전지 섹터 분석 */
  battery: {
    sector: 'battery',
    sectorLabel: '2차전지',
    eventTrigger: '글로벌 전기차 보조금 정책 재확대 및 배터리 원가 하락으로 2차전지 섹터 반등 시도',
    updatedAt: '2026-03-25T09:00:00+09:00',
    nodes: [
      { ticker: '373220', name: 'LG에너지솔루션', tier: 0, relationship: '메이저', dividendYield: 0.0, description: '글로벌 배터리 2위, GM·테슬라 합작공장 가동으로 미국 점유율 확대', signal: 'watch', sourceUrl: KRX_URL },
      { ticker: '006400', name: '삼성SDI', tier: 0, relationship: '메이저', dividendYield: 0.4, description: '원통형·각형 배터리 투트랙 전략, BMW·스텔란티스 공급 확대', signal: 'watch', sourceUrl: KRX_URL },
      { ticker: '247540', name: '에코프로BM', tier: 1, relationship: '직접 납품', description: '하이니켈 양극재 전문 공급사, 국내 셀메이커 직납 최대 수혜', signal: 'watch', sourceUrl: KRX_URL },
      { ticker: '003670', name: '포스코퓨처엠', tier: 1, relationship: '직접 납품', dividendYield: 0.2, description: '양극재·음극재 통합 공급, 포스코 원료 수직계열화 강점', signal: 'wait', sourceUrl: KRX_URL },
      { ticker: '336370', name: '솔루스첨단소재', tier: 2, relationship: '부품/소재', description: '전지박(동박) 전문, 배터리 용량 증가에 따른 수요 구조적 성장', signal: 'wait', sourceUrl: KRX_URL },
      { ticker: '025900', name: '동화기업', tier: 2, relationship: '부품/소재', dividendYield: 1.5, description: '전해액·전해질 소재 공급, 배터리 셀 생산 증가와 직결', signal: 'wait', sourceUrl: KRX_URL },
      { ticker: '009900', name: '명신산업', tier: 3, relationship: '간접 수혜', dividendYield: 1.0, description: '전기차 차체 부품 전문, EV 판매량 회복 시 수주 간접 수혜', signal: 'wait', sourceUrl: KRX_URL },
      { ticker: '365340', name: '성일하이텍', tier: 3, relationship: '간접 수혜', description: '폐배터리 리사이클링 전문, 배터리 순환경제 수요 증가 수혜', signal: 'watch', sourceUrl: KRX_URL },
    ],
  },
};
