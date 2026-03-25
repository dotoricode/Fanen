# 파낸 (Fanen) — 전체 제품 Plan

> 작성일: 2026-03-24
> 버전: 1.0
> PRD 참조: docs/00-pm/fanen.prd.md
> 현재 완료: Sprint 1~3

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 1,410만 개인투자자 중 대다수가 정보 비대칭 속에서 복잡한 HTS/MTS와 전문용어의 장벽 때문에 자신감 있는 투자 판단을 내리지 못한다. 특히 50대 이상 은퇴/예비은퇴 투자자를 위한 접근성 높은 서비스가 전무하다. |
| **Solution** | AI 코치 "핀이(FinAI)"가 뉴스 영향도·배당 시뮬레이션·섹터 인과관계를 쉬운 언어와 음성으로 제공하는 투자 인텔리전스 플랫폼. 구글 OAuth로 빠른 진입, 배당 캘린더로 Beachhead(60대 은퇴자) 조기 확보, 모의투자 게임으로 MZ 유입. |
| **Function UX Effect** | 구글 로그인 1클릭 → 뉴스 신호등 즉시 확인 → 배당 시뮬레이터로 월 수입 설계 → 핀이에게 음성으로 질문 → 모의투자로 실전 연습. 시니어 모드(큰 글씨 + 음성 우선)로 60대도 혼자 사용 가능. |
| **Core Value** | "세상이 움직이면, 파낸이 먼저 압니다" — 복잡한 금융 정보를 누구나 이해하고 활용할 수 있도록 민주화. Free → Pro(9,900원) → Premium(19,900원) 구독 전환으로 지속 성장. |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 정보 소외 투자자(특히 50~60대)가 AI 도움으로 자신감 있는 투자 판단을 내릴 수 있게 한다 |
| **WHO** | Beachhead: 60대 은퇴자 (배당 현금흐름 니즈). Secondary: 40대 직장인(효율), 20대 초보(학습) |
| **RISK** | KRX/DART API 연동 지연, AI 환각 방지 미적용 시 규제 리스크, 음성 기능 지연 시 차별화 약화 |
| **SUCCESS** | Sprint 4 완료 시 실 로그인 사용자 확보, Sprint 5 완료 시 배당 시뮬레이터 Pro 전환율 3%+ |
| **SCOPE** | Sprint 4~8 (인증~차트/데이터) 전체 로드맵. 결제 시스템은 MVP 이후. 카카오 OAuth는 구글 이후 추가. |

---

## 1. 현재 상태 (Sprint 1~3 완료)

### 1.1 구현 완료

| 레이어 | 완료 내용 |
|--------|----------|
| **Backend** | FastAPI 서버 (Railway 서울), JWT 인증 미들웨어, health endpoint |
| **AI API** | POST /api/news/analyze (Gemini + Redis), POST /api/sector/causal |
| **Database** | 11개 Supabase 테이블 (전체 RLS 적용) |
| **Frontend** | NewsImpactList, SectorForceGraph (D3), SectorDrilldownPanel |
| **공통 컴포넌트** | DisclaimerBanner, AiBadge, LanguageToggle, UiModeSwitch, TrafficLightSignal, SubscriptionGate |

### 1.2 알려진 기술 부채

| 파일 | 내용 |
|------|------|
| `useNewsImpacts.ts` | source_url Railway 병합 로직 미완 |
| `SectorForceGraph.tsx` | D3 useEffect cleanup 확인 필요 |
| `railway-api/routes/cron.py` | 실 배포 후 동작 검증 필요 |
| `src/types/database.types.ts` | 자동 생성 스크립트 미적용 (수동 유지 중) |

---

## 2. 제품 로드맵 (Sprint 4~8)

### Sprint 4 — 인증 완성 + 사용자 프로필 [P0, 최우선]

**목표**: 실 사용자 로그인 가능, 개인화 기반 마련

**우선순위 결정**: Beachhead(60대 은퇴자) 타깃 달성을 위해 인증 후 즉시 배당 캘린더로 연결

| # | 기능 | 상세 | 우선도 |
|---|------|------|--------|
| 4-1 | 구글 OAuth | Supabase `signInWithOAuth({ provider: 'google' })`, OAuth 콜백 라우트 완성 | P0 |
| 4-2 | 공통 헤더/내비 | 로고, 내비, 로그인 상태 표시, 모바일 반응형 | P0 |
| 4-3 | 인증 미들웨어 | `middleware.ts` — 보호 라우트 리다이렉트 | P0 |
| 4-4 | 사용자 프로필 | `profiles` 테이블 연동, UI 모드/언어/투자 성향 설정 | P1 |
| 4-5 | 카카오 OAuth | 구글 완료 후 추가 (개발자 앱 등록 필요) | P2 |

**성공 기준**: 구글 계정으로 로그인 → 프로필 설정 → 홈 화면 정상 진입

---

### Sprint 5 — 포트폴리오 + 배당 기능 [P0, Beachhead 핵심]

**목표**: 60대 은퇴자 핵심 가치 제공 — 배당 현금흐름 시각화

| # | 기능 | 상세 | 우선도 |
|---|------|------|--------|
| 5-1 | 배당 캘린더 | `dividend_calendar` 테이블 연동, 월별 배당 일정 + 내 종목 하이라이트 | P0 |
| 5-2 | 배당 시뮬레이터 | "1억 투자 시 월 배당 수령액", 복리 재투자 10/20년 프로젝션 그래프 | P0 |
| 5-3 | 포트폴리오 CRUD | `portfolios` 테이블, 보유 종목 입력/수정/삭제 | P1 |
| 5-4 | 포트폴리오 AI 분석 | Railway FastAPI — 보유 종목별 리스크 스코어 (민감 데이터 처리) | P1 |
| 5-5 | Pro 전환 프롬프트 | 배당 시뮬레이터 3회 무료 사용 후 Pro 업그레이드 유도 | P1 |

**성공 기준**: 배당 시뮬레이터 사용 후 Pro 전환 프롬프트 표시, DisclaimerBanner 필수 렌더링

> **절대 원칙**: 포트폴리오(개인 금융 정보)는 Railway FastAPI에서만 처리, Vercel 처리 금지

---

### Sprint 6 — 모의투자 게임 + 투자 일지 [P1]

**목표**: 20~30대 초보 투자자 유입, 소셜 바이럴 성장 엔진 구축

| # | 기능 | 상세 | 우선도 |
|---|------|------|--------|
| 6-1 | 모의투자 게임 | `mock_accounts/trades` 연동, 시즌제(월간), 가상 시드머니 지급 | P1 |
| 6-2 | 랭킹 시스템 | `mock_rankings` 테이블, 시즌 종료 자동 정산 | P1 |
| 6-3 | 친구 초대 | 카카오톡/링크 공유, 소그룹 리그 | P1 |
| 6-4 | 랭킹 보상 | Top 10% → Pro 무료 체험 1개월 (바이럴 + 전환 루프) | P2 |
| 6-5 | 투자 일지 | `trade_journals` CRUD, AI 자동 분석 ("이번 주 수익률 원인") | P2 |
| 6-6 | 실전 전환 CTA | 시즌 종료 후 실제 계좌 연동 CTA (증권사 제휴 CPA) | P2 |

**Growth Loop**: 모의투자 랭킹 → 카카오 공유 → 친구 초대 → MAU 증가 → 랭킹 경쟁 심화

---

### Sprint 7 — AI 코치 "핀이" + 음성 기능 [P0 차별화]

**목표**: 경쟁사 대비 최고 차별화 기능 출시 — 음성 AI 투자 코치

| # | 기능 | 상세 | 우선도 |
|---|------|------|--------|
| 7-1 | 핀이 채팅 UI | 말풍선 + 핀이 캐릭터 아이콘, Railway `POST /api/coach/ask` 연동 | P0 |
| 7-2 | Gemini 개인화 | 사용자 포트폴리오 + 뉴스 + 섹터 컨텍스트 주입, KRX/DART 수치 바인딩 | P0 |
| 7-3 | Whisper STT | 음성 질문 입력 — `VoiceInput.tsx` 컴포넌트 | P1 |
| 7-4 | Clova TTS | AI 답변 음성 읽기 | P1 |
| 7-5 | 시니어 모드 | 큰 글씨 + 음성 우선 UI (60대 Beachhead 타깃) | P1 |
| 7-6 | 일일 브리핑 | "오늘 시장 어때?" — 음성 시장 브리핑 (출퇴근 40대 타깃) | P2 |

> **절대 원칙**: AI 생성 텍스트에 반드시 AiBadge + 출처 URL 병기, KRX/DART 수치 직접 생성 금지

---

### Sprint 8 — 차트 + 데이터 파이프라인 [P1]

**목표**: KRX/DART 실시간 데이터로 AI 환각 완전 방지 + 차트 UX 완성

| # | 기능 | 상세 | 우선도 |
|---|------|------|--------|
| 8-1 | TradingView 차트 | `StockChart.tsx` — 종목 캔들 차트, `dynamic({ ssr: false })` 필수 | P1 |
| 8-2 | KRX API 연동 | Railway — 실시간 주가 조회, Redis TTL 1분 캐시 | P0 |
| 8-3 | DART API 연동 | Railway — 재무 데이터, Redis TTL 1일 캐시 | P1 |
| 8-4 | Cron 자동화 | Railway cron — `sector_causal_maps` 일별 갱신 | P1 |
| 8-5 | 주요 지수 차트 | 홈/포트폴리오 페이지 — KOSPI, KOSDAQ, S&P500 | P2 |

---

## 3. 구독 플랜 전략

| 플랜 | 가격 | 제공 기능 | 전환 트리거 |
|------|------|----------|------------|
| **Free** | 무료 | 뉴스 영향도(일 3건), 섹터 맵, 모의투자 참여 | — |
| **Pro** | 9,900원/월 | 뉴스 무제한, 배당 시뮬레이터 무제한, AI 코치 핀이, 포트폴리오 분석 | 배당 시뮬레이터 3회 초과 시 프롬프트 |
| **Premium** | 19,900원/월 | Pro + 음성 기능, 일일 브리핑, 우선 분석, 가족 플랜(최대 3인) | 핀이 음성 기능 체험 후 업그레이드 |

> **결제 시스템**: MVP(Sprint 5) 완료 후 도입. 초기 베타 기간 전체 무료 오픈.

---

## 4. 기술 아키텍처 원칙

### 4.1 데이터 레지던시 규칙

```
[브라우저]
    ↓ 비민감 요청
[Vercel/Next.js] ← UI 렌더링, 공개 API만
    ↓ 민감 데이터 요청 (포트폴리오, 거래내역)
[Railway FastAPI, 서울 리전] ← 개인 금융정보 처리
    ↓
[Supabase, ap-northeast-2 서울] ← DB 저장
```

### 4.2 AI 환각 방지 체계

```
AI 출력 금지: 종목명 수치, 주가, 배당수익률 직접 생성
AI 허용: 해석, 요약, 시그널 분류 (KRX/DART 데이터 바인딩 후)

흐름: KRX API → 실제 주가 → Gemini 프롬프트 바인딩 → AI 해석 텍스트 → AiBadge + 출처 URL
```

### 4.3 절대 원칙 체크리스트 (모든 기능에 적용)

- [ ] 분석 화면: `DisclaimerBanner` import + 렌더링
- [ ] AI 출력: `AiBadge` + 출처 URL 병기
- [ ] 신규 테이블: RLS 활성화 + 정책 작성
- [ ] 구독 제한 기능: `checkSubscription` 미들웨어 연결
- [ ] 개인정보: Railway FastAPI 경유만 허용

---

## 5. 리스크 관리

| 리스크 | 가능성 | 영향 | 대응 |
|--------|--------|------|------|
| KRX/DART API 연동 지연 | 중 | 높음 | Sprint 8 우선 착수, mock 데이터로 UI 개발 병행 |
| 음성 API 비용 초과 | 중 | 중간 | Free 플랜 음성 기능 제한, Premium 전용 |
| 카카오 OAuth 심사 지연 | 높음 | 낮음 | 구글 먼저 출시, 카카오는 Sprint 5 이후 |
| AI 환각 규제 리스크 | 낮음 | 높음 | KRX/DART 바인딩 + DisclaimerBanner 철저 준수 |
| Supabase 리전 이전 필요 | 완료 | — | ap-northeast-1 → ap-northeast-2 마이그레이션 필요 |

---

## 6. 성공 지표 (Success Criteria)

| 단계 | 지표 | 목표 |
|------|------|------|
| Sprint 4 완료 | 구글 OAuth 정상 로그인 | 100% |
| Sprint 5 완료 | 배당 시뮬레이터 Pro 전환율 | ≥ 3% |
| Sprint 6 완료 | 모의투자 D7 리텐션 | ≥ 30% |
| Sprint 7 완료 | 핀이 채팅 DAU/MAU 비율 | ≥ 20% |
| Sprint 8 완료 | AI 응답 KRX 데이터 바인딩율 | 100% |
| 3개월 후 | Free → Pro 전환율 | ≥ 5% |

---

## 7. 다음 단계

```
현재: /pdca plan fanen ✅
다음: /pdca design fanen  (Sprint 4 인증 설계)
이후: /pdca do fanen      (구현 시작)
```

**Sprint 4 즉시 착수 항목**:
1. `src/app/(auth)/login/page.tsx` — 구글 OAuth 버튼 연결
2. `src/app/api/auth/callback/route.ts` — OAuth 콜백 완성
3. `src/app/layout.tsx` — 공통 헤더 + 로그인 상태
4. `src/middleware.ts` — 보호 라우트 설정
