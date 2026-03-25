'use client';

import { useState } from 'react';
import { DisclaimerBanner } from '@/components/common';
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
    <div className="min-h-screen bg-[#0A1628] text-slate-100 p-4 md:p-6 max-w-3xl mx-auto">
      {/* 면책 고지 — 모든 분석 화면 필수 */}
      <DisclaimerBanner variant="default" />

      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">불로소득 &amp; 배당 허브</h1>
        <p className="text-sm text-slate-400 mt-1">월 목표 수입을 역산해 투자 경로를 설계하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-slate-700 mb-6">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
    </div>
  );
}
