# 파낸 (Fanen) — 프로젝트 루트 CLAUDE.md

## 제품 정체성
- 서비스명: 파낸 (Fanen)
- 슬로건: "세상이 움직이면, 파낸이 먼저 압니다"
- AI 코치 캐릭터: 핀이 (FinAI)
- 타깃: 20~60대 일반 투자자 (정보 소외 계층)

## 기술 스택
- Frontend + 배포: Next.js 14 (App Router) + TypeScript + TailwindCSS → Vercel
- DB: Supabase (서울 리전 ap-northeast-2 고정)
- 캐시: Upstash Redis
- AI 서비스: FastAPI → Railway 서울 리전
- AI 모델: Gemini API + FinBERT
- 차트: TradingView Lightweight Charts + D3.js
- 음성: Whisper API (STT) + Clova Voice (TTS)

## 절대 원칙 (어떤 이유로도 위반 금지)

### 1. 데이터 레지던시
금융 개인정보(포트폴리오·거래내역·사용자 식별정보)는 Vercel API Routes에서 처리하지 않는다.
민감 데이터는 Railway FastAPI(/railway-api)에서만 처리한다.
Vercel은 UI 렌더링과 비민감 공개 API만 담당한다.

### 2. AI 환각 방지
AI가 종목명·주가·배당수익률 수치를 직접 생성하는 코드를 작성하지 않는다.
모든 금융 수치는 KRX·DART 공식 API에서 가져와 AI 출력에 바인딩한다.
AI 생성 텍스트에는 반드시 출처 URL을 병기하고 "AI 분석" 뱃지를 표시한다.

### 3. 면책 고지
분석 결과가 표시되는 모든 페이지에 DisclaimerBanner 컴포넌트를 import하고 렌더링한다.
고지 문구: "본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다"

### 4. Supabase RLS
새 테이블을 생성할 때 반드시 RLS를 활성화하고 정책을 함께 작성한다.

### 5. 구독 플랜 제한
기능 구현 시 플랜 체크 미들웨어(checkSubscription)를 반드시 연결한다.
Free / Pro / Premium 플랜 구분을 하드코딩하지 않고 상수 파일(lib/plans.ts)에서 참조한다.

## 디렉토리 구조
/fanen
├── src/
│   ├── app/              Next.js App Router 페이지
│   ├── components/       공통 UI 컴포넌트
│   │   └── common/       DisclaimerBanner, AiBadge, LanguageToggle, UiModeSwitch
│   ├── features/         기능별 컴포넌트 (feature 단위 분리)
│   ├── lib/              유틸리티, API 클라이언트, 상수
│   └── types/            TypeScript 타입 정의
├── supabase/             마이그레이션, Edge Functions
├── railway-api/          FastAPI AI 서비스
└── public/

## 응답 언어
항상 한국어로 답한다. 코드 주석도 한국어로 작성한다.
커밋 메시지는 영어로 작성한다 (Conventional Commits 형식).
