# 파낸 (Fanen)

> "세상이 움직이면, 파낸이 먼저 압니다"

정보 소외 계층(20~60대 일반인)을 위한 **AI 기반 투자 인텔리전스 웹앱**.
복잡한 증권 앱과 달리, 국내외 정세를 쉬운 언어로 해석해 섹터·종목 인사이트를 제공합니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript + TailwindCSS |
| 배포 | Vercel |
| DB | Supabase (PostgreSQL + Auth + RLS + Realtime + TimescaleDB) |
| 캐시 | Upstash Redis |
| AI 서비스 | FastAPI (Python) → Railway 서울 리전 |
| AI 모델 | Gemini API + FinBERT |
| 차트 | TradingView Lightweight Charts + D3.js |
| 음성 | Whisper API (STT) + Clova Voice (TTS) |

## 프로젝트 구조

```
fanen/
├── src/
│   ├── app/                  # Next.js App Router 페이지
│   ├── components/common/    # 공통 UI 컴포넌트 (6종)
│   ├── features/             # 기능별 컴포넌트
│   ├── lib/                  # 유틸리티, Supabase 클라이언트, 상수
│   └── types/                # TypeScript 타입 정의
├── supabase/
│   └── migrations/           # SQL 마이그레이션 (11개 테이블 + RLS)
├── railway-api/              # FastAPI AI 서비스
│   └── app/
│       ├── core/             # 설정
│       ├── middleware/        # JWT 인증
│       └── routes/           # API 엔드포인트
└── public/
```

## 스프린트 진행 현황

| 스프린트 | 주제 | 상태 | 문서 |
|---------|------|------|------|
| Sprint 1 | FastAPI 서버, 인증 미들웨어, 헬스 엔드포인트 | ✅ 완료 | [docs/sprint1.md](docs/sprint1.md) |
| Sprint 2 | 뉴스 분석 API, 섹터 인과관계 API, Gemini 통합, Redis 캐시 | ✅ 완료 | [docs/sprint2.md](docs/sprint2.md) |
| Sprint 3 | NewsImpactList, SectorMapSection, SectorForceGraph(D3), SSR 버그 수정 | ✅ 완료 | [docs/sprint3.md](docs/sprint3.md) |

## 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.12 (3.14 미지원 — [이슈 참고](docs/troubleshooting.md#2-pydantic-core-빌드-실패-python-314))
- Colima (Docker 런타임) + Supabase CLI

### Frontend (Next.js)

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일에 실제 값 입력

# 개발 서버 실행
npm run dev
```

`http://localhost:3000`에서 확인 가능합니다.

### Backend (FastAPI)

```bash
cd railway-api

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에 실제 값 입력

# 개발 서버 실행
uvicorn app.main:app --reload --port 8000
```

`http://localhost:8000/health`에서 헬스체크 가능합니다.

### Supabase 로컬 개발

```bash
# 0. Colima 실행 확인 (macOS 재시작 시 매번 필요)
colima start

# 1. 로컬 Supabase 시작 (마이그레이션 자동 적용)
supabase start

# 2. 원격 프로젝트 연결 (최초 1회)
supabase link --project-ref prynzbofjuiptsjzunby

# 3. 원격 DB에 마이그레이션 반영
supabase db push
```

> **주의**: Colima + virtiofs 환경에서 `docker.sock` 마운트 오류가 발생하면
> [트러블슈팅 #5](docs/troubleshooting.md#5-supabase-start--dockersock-마운트-실패-virtiofs)를 참고하세요.

## 환경변수

### Frontend (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RAILWAY_API_URL=http://localhost:8000
```

### Backend (railway-api/.env)

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token
```

## 공통 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| `DisclaimerBanner` | 면책 고지 배너 (variant: default, pack, tax, signal) |
| `AiBadge` | AI 생성 콘텐츠 뱃지 (출처 URL 링크 지원) |
| `LanguageToggle` | 전문가 ↔ 일반인 언어 모드 전환 |
| `UiModeSwitch` | Standard ↔ Senior UI 모드 전환 |
| `TrafficLightSignal` | 교통신호등 매매 시그널 (buy/hold/sell) |
| `SubscriptionGate` | 구독 플랜 기반 기능 접근 제어 |

## 트러블슈팅

개발 중 발생한 에러와 해결법은 [docs/troubleshooting.md](docs/troubleshooting.md)에 기록되어 있습니다.

| # | 이슈 | 핵심 해결책 |
|---|------|------------|
| 1 | Claude Code 스킬 인식 안 됨 | `skills/<name>/SKILL.md` 경로 확인 |
| 2 | pydantic-core 빌드 실패 | Python 3.12 venv 재생성 |
| 3 | config.toml 파싱 에러 | `[project]` → `project_id` 변경 |
| 4 | Docker daemon 연결 실패 | `colima start` |
| 5 | docker.sock 마운트 실패 | `DOCKER_HOST=unix:///var/run/docker.sock` |
| 6 | supabase db push — ref 없음 | `supabase link --project-ref <ref>` |
| 7 | DB 버전 불일치 경고 | `config.toml` major_version 수정 |
| 8 | Supabase 리전 변경 불가 | 새 프로젝트 생성 후 마이그레이션 |

## DB 스키마 (Supabase)

11개 테이블, 전체 RLS 적용:

- `profiles` — 사용자 프로필 (UI 모드, 언어 설정, 투자 성향)
- `portfolios` — 실제 보유 포트폴리오
- `dividend_simulations` — 배당 시뮬레이션 결과
- `news_impacts` — 뉴스 임팩트 스코어 (공개)
- `sector_causal_maps` — 섹터 인과관계 맵 (공개)
- `mock_seasons` — 모의투자 시즌 (공개)
- `mock_accounts` — 모의투자 계좌
- `mock_trades` — 모의투자 거래 내역
- `mock_rankings` — 모의투자 랭킹
- `trade_journals` — 투자 일지
- `dividend_calendar` — 배당 캘린더 (공개)

## 라이선스

이 프로젝트는 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) 하에 배포됩니다.

- 소스 코드를 자유롭게 사용·수정·배포할 수 있습니다.
- 이 소프트웨어를 네트워크 서비스(SaaS)로 운영하는 경우, 수정된 소스 코드를 동일 라이선스로 공개해야 합니다.
- 상용 라이선스가 필요한 경우 별도 문의하세요.

Copyright (c) 2026 Fanen Team