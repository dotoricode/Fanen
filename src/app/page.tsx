import Link from 'next/link';
import { DisclaimerBanner, StockChart } from '@/components/common';
import { NewsImpactList } from '@/features/news-impact';
import { SectorMapSection } from '@/features/sector-map';
import { getKrxIndex } from '@/lib/railway';
import type { StockIndexResponse } from '@/types/market.types';

/**
 * 홈 페이지 — 시장 현황 차트 + 뉴스 임팩트 + 섹터 인과관계 통합 뷰
 * 서버 컴포넌트 (NewsImpactList, SectorMapSection은 내부에서 'use client' 처리)
 * KRX 지수는 서버에서 prefetch — Railway 미실행 시 null 처리
 */
export default async function HomePage() {
  // KRX 지수 조회 — Railway 미실행 환경에서도 페이지가 깨지지 않도록 try-catch 처리
  let kospiData: StockIndexResponse | null = null;
  let kosdaqData: StockIndexResponse | null = null;

  try {
    [kospiData, kosdaqData] = await Promise.all([
      getKrxIndex('KOSPI'),
      getKrxIndex('KOSDAQ'),
    ]);
  } catch {
    // Railway 미실행 시 차트 섹션을 숨김 처리 (에러 무시)
  }

  const showMarketSection = kospiData !== null || kosdaqData !== null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* 서비스 헤더 */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">파낸</h1>
          <p className="text-lg text-gray-600">세상이 움직이면, 파낸이 먼저 압니다</p>
        </header>

        {/* 공통 면책 고지 */}
        <DisclaimerBanner variant="default" />

        {/* 시장 현황 차트 섹션 — Railway 연결 시에만 표시 */}
        {showMarketSection && (
          <section className="mx-auto max-w-7xl px-0 py-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">시장 현황</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kospiData && (
                <StockChart
                  data={kospiData.chart_data}
                  title="코스피"
                  type="line"
                  isMock={kospiData.mock}
                />
              )}
              {kosdaqData && (
                <StockChart
                  data={kosdaqData.chart_data}
                  title="코스닥"
                  type="line"
                  isMock={kosdaqData.mock}
                />
              )}
            </div>
          </section>
        )}

        {/* 뉴스 임팩트 섹션 */}
        <section>
          <NewsImpactList />
          <div className="mt-4 text-right">
            <Link href="/news" className="text-sm text-primary hover:underline">
              뉴스 임팩트 전체 보기 →
            </Link>
          </div>
        </section>

        {/* 섹터 인과관계 섹션 */}
        <section>
          <SectorMapSection />
          <div className="mt-4 text-right">
            <Link href="/sector" className="text-sm text-primary hover:underline">
              섹터 인과관계 전체 보기 →
            </Link>
          </div>
        </section>

        {/* 로그인 유도 */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-block rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-600"
          >
            시작하기
          </Link>
        </div>
      </div>
    </main>
  );
}
