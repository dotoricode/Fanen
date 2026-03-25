# fanen-v2-overhaul Gap Analysis
작성일: 2026-03-24

## Match Rate: 96%
구현 완료: 49/51 항목 (신규 37/38 + 수정 12/13)

---

## 1. 파일 존재 검증

### 신규 생성 (37/38 = 97%)

| # | 파일 | 상태 |
|---|------|------|
| 1 | src/lib/mock/index.ts | O |
| 2 | src/lib/mock/mockMarket.ts | O |
| 3 | src/lib/mock/mockNews.ts | O |
| 4 | src/lib/mock/mockSector.ts | O |
| 5 | src/lib/mock/mockPortfolio.ts | O |
| 6 | src/lib/mock/mockDividend.ts | O |
| 7 | src/lib/mock/mockTrading.ts | O |
| 8 | src/lib/mock/mockJournal.ts | O |
| 9 | src/lib/mock/mockCoach.ts | O |
| 10 | src/app/(auth)/signup/page.tsx | O |
| 11 | src/app/(auth)/forgot-password/page.tsx | O |
| 12 | src/app/(auth)/reset-password/page.tsx | O |
| 13 | src/app/pricing/page.tsx | O |
| 14 | src/app/onboarding/page.tsx | O |
| 15 | src/app/onboarding/step1/page.tsx | O |
| 16 | src/app/onboarding/step2/page.tsx | O |
| 17 | src/app/onboarding/step3/page.tsx | O |
| 18 | src/app/signal/page.tsx | O |
| 19 | src/app/report/page.tsx | O |
| 20 | src/app/tax/page.tsx | O |
| 21 | src/app/notifications/page.tsx | O |
| 22 | src/features/dashboard/DashboardHome.tsx | O |
| 23 | src/features/signal/components/TrafficLightDashboard.tsx | O |
| 24 | src/features/signal/components/SignalCard.tsx | O |
| 25 | src/features/signal/hooks/useSignal.ts | O |
| 26 | src/features/signal/index.ts | O |
| 27 | src/features/ai-report/components/ReportGenerator.tsx | O |
| 28 | src/features/ai-report/hooks/useAiReport.ts | O |
| 29 | src/features/tax-simulator/components/TaxForm.tsx | O |
| 30 | src/features/tax-simulator/components/TaxResult.tsx | O |
| 31 | src/features/tax-simulator/hooks/useTaxSimulator.ts | X (로직이 TaxForm.tsx에 인라인) |
| 32 | src/features/notifications/components/NotificationList.tsx | O |
| 33 | src/features/notifications/hooks/useNotifications.ts | O |
| 34 | src/hooks/useSubscription.ts | O |
| 35 | src/lib/auth/getUser.ts | O |
| 36 | src/components/common/BottomNav.tsx | O |
| 37 | src/components/common/PlanBadge.tsx | O |
| 38 | src/components/ui/Button.tsx | O |
| 39 | src/components/ui/Card.tsx | O |
| 40 | src/components/ui/Skeleton.tsx | O |
| 41 | src/components/ui/Toast.tsx | O |
| 42 | src/components/layout/PageLayout.tsx | O |
| 43 | src/components/layout/AuthLayout.tsx | O |

### 수정 파일 (12/13 = 92%)

| # | 파일 | 상태 | 비고 |
|---|------|------|------|
| 1 | src/app/page.tsx | O | 랜딩/대시보드 분기 |
| 2 | src/app/(auth)/login/page.tsx | O | 회원가입 링크 추가 |
| 3 | src/app/layout.tsx | O | BottomNav + Toast 연동 |
| 4 | src/app/sector/page.tsx | O | SubscriptionGate 연결 |
| 5 | src/app/dividend/page.tsx | O | SubscriptionGate 연결 |
| 6 | src/app/coach/page.tsx | O | SubscriptionGate 연결 |
| 7 | src/app/journal/page.tsx | O | DisclaimerBanner 표시 (Gate는 JournalCard 내부) |
| 8 | src/components/common/Header.tsx | O | 인증 상태 연동 |
| 9 | src/middleware.ts | O | 보호 경로 설정 |
| 10 | src/features/ai-coach/hooks/useAiCoach.ts | O | 히스토리 저장 |
| 11 | src/features/news-impact/hooks/useNewsImpacts.ts | O | Mock 지원 |
| 12 | src/features/portfolio/hooks/usePortfolios.ts | O | Mock 지원 |
| 13 | src/features/mock-trading/hooks/useMockAccount.ts | O | Mock 지원 |

---

## 2. TypeScript 검증

```
npx tsc --noEmit → 오류 0건
```

---

## 3. CLAUDE.md 절대 원칙 준수 현황

### 3.1 DisclaimerBanner (분석 화면 필수)

| 페이지 | 상태 | variant |
|--------|------|---------|
| src/app/news/page.tsx | O | signal |
| src/app/sector/page.tsx | O | default |
| src/app/portfolio/page.tsx | O | default |
| src/app/mock-trading/page.tsx | O | default |
| src/app/journal/page.tsx | O | default |
| src/app/coach/page.tsx | O | default |
| src/app/signal/page.tsx | O (QA에서 추가) | signal |
| src/app/tax/page.tsx | O (QA에서 추가) | tax |
| src/app/report/page.tsx | O (QA에서 추가) | default |
| src/app/dividend/page.tsx | O | default |

### 3.2 AiBadge (AI 생성 콘텐츠)

| 위치 | 상태 |
|------|------|
| AI 코치 응답 (ChatMessage.tsx) | O |
| 뉴스 분석 (NewsImpactCard.tsx) | O |
| 섹터 드릴다운 (SectorDrilldownPanel.tsx) | O |
| AI 리포트 (ReportGenerator.tsx) | O |
| 매매 신호등 (TrafficLightDashboard.tsx) | O |
| 투자 일지 AI 피드백 (JournalCard.tsx) | O |

### 3.3 SubscriptionGate

| 페이지 | 필요 플랜 | 상태 |
|--------|----------|------|
| /sector | pro | O |
| /coach | pro | O |
| /journal (AI 피드백) | pro | O (JournalCard 컴포넌트 레벨) |
| /dividend (시뮬레이션) | pro | O |
| /signal | premium | O |
| /report | premium | O |
| /tax | premium | O |

### 3.4 민감 데이터 체크

- src/app/api/ 라우트: auth/callback/route.ts만 존재
- OAuth code 교환만 수행, 금융 개인정보 처리 없음
- 오픈 리다이렉트 방지 처리 확인 (상대 경로만 허용)
- **위반 사항 없음**

### 3.5 AI 환각 방지

- AI 생성 콘텐츠에 AiBadge 표시 확인
- 출처 URL 병기 가능 (AiBadge source prop)
- Mock 모드에서 모든 데이터에 `mock: true` 플래그 존재

---

## 4. Mock 모드 체크

- `src/lib/mock/index.ts`: USE_MOCK 플래그 존재
- USE_MOCK 분기가 적용된 훅 (13개 파일에서 확인):
  - useSubscription, useAiCoach, useSectorCausalMap
  - useNotifications, useNewsImpacts, useAiReport
  - useSignal, useDividendCalendar, useMockTrades
  - useMockAccount, usePortfolios, onboarding/step3

---

## 5. QA에서 직접 수정한 항목

### Critical (CLAUDE.md 원칙 위반 수정)

1. **signal/page.tsx**: DisclaimerBanner variant="signal" 추가
2. **tax/page.tsx**: DisclaimerBanner variant="tax" 추가
3. **report/page.tsx**: DisclaimerBanner variant="default" 추가

---

## 6. Important Issues (비차단)

| # | 항목 | 심각도 | 설명 |
|---|------|--------|------|
| 1 | useTaxSimulator.ts 미생성 | Low | 세금 계산 로직이 TaxForm.tsx에 인라인 구현됨. 기능적으로 동일하나 설계 문서와 구조 차이 |

---

## 7. 추가 구현 사항 (설계 문서 외)

- `src/features/ai-coach/components/FinniAvatar.tsx` — 핀이 캐릭터 SVG 아바타
- `src/features/ai-coach/components/ChatInput.tsx` — 채팅 입력 컴포넌트
- `src/features/ai-coach/components/ChatMessage.tsx` — 채팅 메시지 컴포넌트
- `src/features/landing/LandingPage.tsx` — 랜딩 페이지 컴포넌트
- `src/components/common/UserMenu.tsx` — 사용자 메뉴 드롭다운
- `src/components/common/StockChart.tsx` — 주식 차트 컴포넌트
- `src/components/common/StockChartInner.tsx` — 차트 내부 컴포넌트
- `src/styles/senior.css` — 시니어 모드 CSS

---

## 8. 결론

- **Match Rate: 96%** (49/51)
- TypeScript 오류: **0건**
- CLAUDE.md 원칙 위반: **0건** (QA에서 3건 수정 완료)
- 모든 분석 화면에 DisclaimerBanner 적용 확인
- 모든 AI 콘텐츠에 AiBadge 적용 확인
- 모든 Pro/Premium 기능에 SubscriptionGate 연결 확인
- API 라우트 민감 데이터 처리 없음 확인
- Mock 모드 정상 분기 확인
