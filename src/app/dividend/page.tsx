'use client';

import { useState } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import TutorialPopup from '@/components/common/TutorialPopup';
import DividendCalendar from '@/features/dividend/components/DividendCalendar';
import PassiveIncomeCalculator from '@/features/dividend/components/PassiveIncomeCalculator';
import MonthlyETFSimulator from '@/features/dividend/components/MonthlyETFSimulator';

type Tab = 'calculator' | 'simulator' | 'calendar';

/** 탭 메뉴 정의 */
const TABS: { id: Tab; label: string }[] = [
  { id: 'calculator', label: '불로소득 계산기' },
  { id: 'simulator', label: 'ETF 시뮬레이터' },
  { id: 'calendar', label: '배당 캘린더' },
];

/** 불로소득 & 배당 허브 페이지 — 3탭 구조 */
export default function DividendPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 max-w-3xl mx-auto">
      {/* 면책 고지 — 모든 분석 화면 필수 */}
      <DisclaimerBanner variant="default" />

      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">배당 계산기</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">월 목표 수입을 역산해 투자 경로를 설계하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'border-teal-500 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'calculator' && <PassiveIncomeCalculator />}
      {activeTab === 'simulator' && <MonthlyETFSimulator />}
      {activeTab === 'calendar' && <DividendCalendar />}

      {/* 배당 계산기 튜토리얼 팝업 */}
      <TutorialPopup
        pageKey="dividend"
        tutorialTitle="배당 계산기 활용법"
        steps={[
          { emoji: '💵', title: '불로소득 목표 계산', description: '월 목표 배당 수입을 설정하면 필요한 투자 원금을 자동으로 계산해드립니다.' },
          { emoji: '📅', title: '배당 캘린더', description: '보유 종목의 배당 지급일을 달력으로 확인하세요. 월별 현금흐름을 한눈에 파악할 수 있어요.' },
          { emoji: '🌙', title: '월배당 ETF 시뮬레이터', description: '매월 일정 금액을 월배당 ETF에 투자했을 때 미래 배당 수입을 시뮬레이션해보세요.' },
        ]}
      />
    </div>
  );
}
