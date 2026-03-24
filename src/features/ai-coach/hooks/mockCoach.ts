/** AI 코치 반디 Mock 응답 데이터 */

/** Mock 응답 목록 */
const MOCK_RESPONSES = [
  {
    answer:
      '좋은 질문이에요! 현재 시장 상황을 종합적으로 살펴보면, 코스피는 최근 박스권 흐름을 보이고 있습니다. 투자 결정 전에 기업의 재무제표와 업종 트렌드를 꼭 확인해보세요.',
    source_urls: ['https://data.krx.co.kr'],
    disclaimer:
      '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다.',
  },
  {
    answer:
      '배당주 투자를 시작하려면 먼저 배당수익률과 배당성향을 확인하는 것이 중요합니다. 안정적인 배당을 지급하는 기업들의 과거 배당 이력을 DART 공시에서 확인해보세요.',
    source_urls: ['https://dart.fss.or.kr'],
    disclaimer:
      '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다.',
  },
  {
    answer:
      '분산 투자란 여러 자산에 나누어 투자하여 위험을 줄이는 전략입니다. "계란을 한 바구니에 담지 마라"는 격언처럼, 업종·자산·지역을 분산하면 변동성을 낮출 수 있어요.',
    source_urls: [],
    disclaimer:
      '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다.',
  },
  {
    answer:
      '삼성전자의 최신 실적은 DART 공시를 통해 확인하실 수 있습니다. PER, PBR 등 밸류에이션 지표와 함께 반도체 업황 전망도 함께 살펴보시는 것을 추천드려요.',
    source_urls: ['https://dart.fss.or.kr', 'https://data.krx.co.kr'],
    disclaimer:
      '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다.',
  },
  {
    answer:
      '요즘 시장은 글로벌 금리 동향과 환율 변동에 영향을 많이 받고 있어요. 투자 전에 거시경제 지표를 확인하고, 자신의 투자 목표와 기간에 맞는 전략을 세워보세요.',
    source_urls: ['https://data.krx.co.kr'],
    disclaimer:
      '본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다.',
  },
];

/** Mock 코치 응답을 1.5초 지연 후 반환 */
export async function mockAskCoach(_params: {
  question: string;
  language_level?: string;
}): Promise<{
  answer: string;
  source_urls: string[];
  disclaimer: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const idx = Math.floor(Math.random() * MOCK_RESPONSES.length);
  return MOCK_RESPONSES[idx];
}
