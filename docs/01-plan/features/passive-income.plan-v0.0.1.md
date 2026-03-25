# 불로소득 & 배당 허브 — Plan Document

> 버전: v0.0.1
> 작성일: 2026-03-25
> PRD 참조: docs/00-pm/binah.prd.md § Feature 3
> 상위 계획: docs/01-plan/binah.plan.md § 5
> Sprint: 13

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 기존 `/dividend` 페이지에 DividendSimulator·DividendCalendar는 있으나 "목표 월 불로소득 역산 계산기"와 "투자 성향 분류"가 없어 사용자가 목표 달성 경로를 스스로 설계하지 못한다. |
| **Solution** | PassiveIncomeCalculator(역산 계산기)·MonthlyETFSimulator·투자 성향 5분류 포트폴리오 추천을 `/dividend` 페이지에 통합하여 "월 50만원 불로소득" 원스톱 설계 플로우 완성. |
| **Function UX Effect** | 목표 금액 입력 → 필요 투자금 + 추천 포트폴리오 → ETF 복리 시뮬레이션 → 반디 멘트. 배당 캘린더까지 한 페이지에서 확인 가능. |
| **Core Value** | "반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록" — Value Chain 발굴 이후 실제 투자 실행 경로를 제시. |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | PRD Beachhead(40~55세 배당 직장인)의 핵심 니즈: "월 100만원 배당 포트폴리오 설계". Value Chain으로 종목 발굴 → 불로소득 계산기로 포지션 설계까지 이어지는 플로우 완성. |
| **WHO** | 40~55세 배당 관심 직장인, 60대 은퇴 예비자, 20대 불로소득 설계 입문자 |
| **RISK** | (1) 실제 ETF 데이터 미연동(mock) — AI 환각 방지 원칙상 mock만 허용 (2) 투자 성향 분류 알고리즘이 과단순할 경우 UX 신뢰도 하락 |
| **SUCCESS** | (1) PassiveIncomeCalculator 렌더링 오류 0건 (2) 계산기 입력→결과 플로우 완전 동작 (3) 투자 성향 5종 필터 동작 (4) TS 오류 0건 (5) DisclaimerBanner·AiBadge 원칙 준수 |
| **SCOPE** | `src/features/dividend/` 확장 + `/dividend` 페이지 개편. 새 feature 디렉토리 생성 없음. |

---

## 1. 구현 범위

### 1.1 신규 컴포넌트 (3개)

| 파일 | 역할 |
|------|------|
| `src/features/dividend/components/PassiveIncomeCalculator.tsx` | 목표 월 불로소득 입력 → 필요 투자금 + 포트폴리오 역산 |
| `src/features/dividend/components/MonthlyETFSimulator.tsx` | ETF 복리 재투자 시뮬레이션 차트 (D3 또는 recharts) |
| `src/features/dividend/components/PortfolioTypeFilter.tsx` | 투자 성향 5분류 탭 필터 |

### 1.2 수정 파일 (3개)

| 파일 | 변경 내용 |
|------|---------|
| `src/features/dividend/types.ts` | PassiveIncomeResult, PortfolioType, ETFMockData 타입 추가 |
| `src/lib/mock/mockDividend.ts` | ETF mock 데이터 5종, 성향별 추천 포트폴리오 mock 추가 |
| `src/app/dividend/page.tsx` | 탭 구조로 개편: 불로소득 계산기 / ETF 시뮬레이터 / 배당 캘린더 |

---

## 2. 기능 상세

### 2.1 PassiveIncomeCalculator

```
입력:
  - 목표 월 불로소득 (예: 500,000원)
  - 예상 연 배당수익률 (기본: 4%)

계산:
  - 필요 투자금 = 목표 월 불로소득 × 12 / 연 배당수익률
  - 포트폴리오 추천: 배당형 ETF + 고배당주 혼합 비율 제시

출력:
  - 필요 투자금: ○○만원
  - 추천 구성: ETF XX% / 고배당주 XX% / 리츠 XX%
  - 반디 멘트: "이 구성이면 Value Chain 방산 수혜까지 겸할 수 있어요! 🎯"
  - DisclaimerBanner + AiBadge (CLAUDE.md 원칙)
```

### 2.2 MonthlyETFSimulator

```
입력:
  - ETF 선택 (TIGER 미국배당다우존스 / KODEX 배당성장 / 직접 입력)
  - 투자 원금 (만원)
  - 투자 기간 (년)
  - 배당 재투자 여부

출력:
  - 연도별 포트폴리오 가치 + 누적 배당금 차트
  - 재투자 vs 비재투자 비교
  - 기존 calculateDividend() 함수 재활용
```

### 2.3 PortfolioTypeFilter

```
5분류 탭:
  💰 배당형    - 시가배당률 3%+, 배당 안정성
  📊 가치형    - PER 10 이하, PBR 1 이하
  🚀 성장형    - 매출성장률 15%+, 영업이익률 10%+
  🌐 테마형    - Value Chain 연계 (방산/반도체/2차전지)
  🛡️ ETF안정형 - 월배당 ETF, 저변동성, 분산투자
```

---

## 3. 페이지 구조 (`/dividend`)

```
/dividend
├── [탭 1] 불로소득 계산기
│   ├── PassiveIncomeCalculator
│   └── PortfolioTypeFilter (결과 연계)
├── [탭 2] ETF 시뮬레이터
│   └── MonthlyETFSimulator
└── [탭 3] 배당 캘린더 (기존 유지)
    └── DividendCalendar
```

---

## 4. CLAUDE.md 원칙 체크리스트

- [ ] `DisclaimerBanner` — `/dividend` page.tsx에 렌더링
- [ ] `AiBadge` — PassiveIncomeCalculator 결과 섹션에 표시
- [ ] `sourceUrl` — mock 데이터 모든 항목에 KRX URL 포함
- [ ] AI가 수치 직접 생성 금지 — mock 파일에서만 참조
- [ ] TypeScript strict 오류 0건

---

## 5. 성공 기준

| 기준 | 검증 방법 |
|------|---------|
| 계산기 입력 → 결과 표시 | 브라우저 `/dividend` 탭 1 동작 확인 |
| ETF 시뮬레이터 차트 렌더링 | 탭 2 차트 표시 확인 |
| 5분류 포트폴리오 필터 | 탭 필터 클릭 시 종목 교체 |
| 기존 배당 캘린더 유지 | 탭 3 정상 동작 |
| TypeScript 오류 | `npx tsc --noEmit` 결과 0건 |
| 모바일 반응형 | width < 768px 레이아웃 확인 |
