# 파낸 (Fanen) — 남은 작업 목록

> 마지막 업데이트: 2026-03-24 (Sprint 3 완료 직후)
> 이 문서는 다음 세션에서 작업을 이어갈 수 있도록 현재 상태와 남은 작업을 정리한다.

---

## 현재 완료된 스프린트

| 스프린트 | 범위 | 상태 |
|---------|------|------|
| Sprint 1 | FastAPI 서버, 인증 미들웨어, health endpoint | ✅ |
| Sprint 2 | POST /api/news/analyze, POST /api/sector/causal, Gemini, Redis | ✅ |
| Sprint 3 | NewsImpactList, SectorMapSection, SectorForceGraph(D3), SSR 버그 수정 | ✅ |

---

## Sprint 4 — 인증 완성 + 사용자 프로필 (다음 작업)

### 4-1. 로그인 UI 완성
- [ ] `src/app/(auth)/login/page.tsx` — 카카오/구글 OAuth 버튼 UI 연결
  - Supabase `signInWithOAuth({ provider: 'kakao' | 'google' })` 호출
  - OAuth 콜백 라우트 `src/app/api/auth/callback/` 확인 및 완성
- [ ] 로그인 성공 후 홈(`/`) 리다이렉트
- [ ] 로그아웃 버튼 — 레이아웃 헤더에 추가

### 4-2. 레이아웃 / 내비게이션
- [ ] `src/app/layout.tsx` — 공통 헤더(로고, 내비, 로그인 상태) 구현
- [ ] 모바일 반응형 내비게이션
- [ ] 인증 보호 미들웨어 (`middleware.ts`) — 로그인 필요 페이지 리다이렉트

### 4-3. 사용자 프로필
- [ ] `src/features/profile/` — 프로필 설정 feature 생성
  - `useProfile.ts` — Supabase `profiles` 테이블 조회/업데이트 훅
  - `ProfileForm.tsx` — UI 모드, 언어 레벨, 투자 성향 설정
- [ ] `src/app/profile/page.tsx`

---

## Sprint 5 — 포트폴리오 + 배당 기능

### 5-1. 포트폴리오 관리
- [ ] `src/features/portfolio/` feature 생성
  - `usePortfolio.ts` — Supabase `portfolios` 테이블 CRUD
  - `PortfolioList.tsx`, `PortfolioForm.tsx`
- [ ] `src/app/portfolio/page.tsx`
- [ ] Railway API 연동 — 보유 종목별 AI 분석 (민감 데이터이므로 Railway만 처리)

### 5-2. 배당 캘린더
- [ ] `src/features/dividend/` feature 생성
  - `DividendCalendar.tsx` — 배당 일정 달력 뷰
  - `DividendSimulator.tsx` — 배당 시뮬레이션 입력/결과
  - `useDividendCalendar.ts` — `dividend_calendar` 테이블 조회
- [ ] `src/app/dividend/page.tsx`
- [ ] `DisclaimerBanner variant="dividend"` 렌더링 필수

---

## Sprint 6 — 모의투자

### 6-1. 모의투자 게임
- [ ] `src/features/mock-trading/` feature 생성
  - `MockTradingBoard.tsx` — 시즌별 랭킹 + 내 계좌 현황
  - `TradeForm.tsx` — 매수/매도 입력 폼
  - `useMockTrading.ts` — `mock_accounts`, `mock_trades` 연동
- [ ] `src/app/mock-trading/page.tsx`
- [ ] Railway API — 실시간 가격 조회 (KRX API 연동)
- [ ] 시즌 종료 시 자동 랭킹 정산 로직

### 6-2. 투자 일지
- [ ] `src/features/trade-journal/` feature 생성
  - `TradeJournalList.tsx`, `TradeJournalForm.tsx`
  - `useTradeJournal.ts` — `trade_journals` 테이블 CRUD
- [ ] `src/app/journal/page.tsx`

---

## Sprint 7 — AI 코치 "핀이" + 음성 기능

### 7-1. AI 코치 핀이 (FinAI)
- [ ] `src/features/fin-ai/` feature 생성
  - `FinAiChat.tsx` — 채팅 UI (말풍선 + 핀이 캐릭터 아이콘)
  - `useFinAi.ts` — Railway AI 코치 API 연동
- [ ] Railway API `POST /api/coach/ask` — Gemini로 개인화 투자 조언
  - 사용자 포트폴리오 + 뉴스 + 섹터 컨텍스트 주입
  - AI 생성 수치는 반드시 KRX·DART 데이터 바인딩
- [ ] 모든 AI 응답에 `AiBadge` + 출처 URL 병기

### 7-2. 음성 기능
- [ ] Whisper API (STT) — 음성 입력으로 질문
- [ ] Clova Voice (TTS) — AI 답변 음성 읽기
- [ ] `src/features/fin-ai/components/VoiceInput.tsx`

---

## Sprint 8 — 차트 + 데이터 파이프라인

### 8-1. TradingView Lightweight Charts
- [ ] `src/components/common/StockChart.tsx` — 종목별 캔들 차트
  - `dynamic(() => import(...), { ssr: false })` 필수 (브라우저 전용)
- [ ] 홈/포트폴리오 페이지에 주요 지수 차트 추가

### 8-2. KRX·DART 데이터 파이프라인
- [ ] Railway API — KRX 공식 API 연동 (실시간 주가 조회)
- [ ] Railway API — DART 공시 API 연동 (재무 데이터)
- [ ] Upstash Redis 캐시 — 주가 데이터 TTL 1분, 재무 데이터 TTL 1일
- [ ] Railway cron (`cron.json`) — `sector_causal_maps` 일별 자동 갱신

---

## 기술 부채 / 리팩토링

### 타입 시스템
- [ ] Supabase 타입 자동 생성 스크립트 추가
  ```bash
  supabase gen types typescript --project-id <id> > src/types/database.types.ts
  ```
  현재 수동 작성 + `Relationships: []` 추가 필요 — 자동화하면 해결됨
- [ ] `createClient()` null 체크 패턴 공통화 (`useSupabaseQuery` 훅 추출 고려)

### 보안
- [ ] `.env.local.example` 파일 최신화 (모든 환경변수 문서화)
- [ ] Railway API Rate Limiting 미들웨어 추가
- [ ] Supabase RLS 정책 리뷰 — `news_impacts`, `sector_causal_maps` 공개 테이블 읽기 정책 확인

### 인프라
- [ ] Vercel 프로덕션 배포 설정 (환경변수 주입)
- [ ] Railway 프로덕션 배포 확인 (서울 리전)
- [ ] GitHub Actions CI — `npm run build` + `tsc --noEmit` 자동 검증

---

## 알려진 잠재 이슈

| 파일 | 내용 |
|------|------|
| `useNewsImpacts.ts:71` | `source_url: null` — Railway analyzeNews 응답의 `source_url` 병합 로직 미완 |
| `SectorForceGraph.tsx` | D3 시뮬레이션 cleanup (useEffect return) 확인 필요 |
| `src/app/(auth)/login/page.tsx` | 카카오 OAuth 실제 연결 미완 (UI만 있음) |
| `railway-api/app/routes/cron.py` | 크론 스케줄 실제 배포 후 동작 검증 필요 |

---

## 다음 세션 시작 방법

```bash
cd D:/00_work/Fanen

# 현재 상태 확인
git log --oneline -5

# 개발 서버 실행
npm run dev

# TypeScript 검증
npx tsc --noEmit

# 파이프라인으로 새 작업 시작
# /develop :plan <요구사항>
```

> **CLAUDE.md 절대 원칙** 반드시 숙지: DisclaimerBanner, AiBadge, RLS, 구독 플랜 체크, 금융 수치 AI 직접 생성 금지
