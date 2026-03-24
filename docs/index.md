# 파낸 (Fanen) 개발 문서

> "세상이 움직이면, 파낸이 먼저 압니다"

## 스프린트 목록

| 스프린트 | 주제 | 상태 |
|---------|------|------|
| [Sprint 1](./sprint1.md) | 백엔드 기반 — FastAPI 서버 구축 | ✅ 완료 |
| [Sprint 2](./sprint2.md) | AI 분석 API — Gemini 통합 | ✅ 완료 |
| [Sprint 3](./sprint3.md) | 프론트엔드 UI — 뉴스/섹터 컴포넌트 | ✅ 완료 |

## 참고 문서

| 문서 | 내용 |
|------|------|
| [남은 작업 목록](./TODO.md) | 스프린트별 미완성 태스크 |
| [보안 체크리스트](./security.md) | 보안 이슈 추적 및 프로덕션 배포 전 필수 항목 |

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS → Vercel
- **Database**: Supabase (ap-northeast-2 서울 리전)
- **Cache**: Upstash Redis
- **AI 서비스**: FastAPI → Railway
- **AI 모델**: Gemini API + FinBERT
- **차트**: TradingView Lightweight Charts + D3.js

## 절대 원칙

1. 금융 개인정보는 Railway FastAPI에서만 처리 (Vercel 처리 금지)
2. AI 환각 방지 — 금융 수치는 KRX·DART 공식 API에서 바인딩
3. 분석 화면 전체 `DisclaimerBanner` 렌더링 필수
4. Supabase 신규 테이블 생성 시 RLS 활성화 필수
5. 구독 플랜 체크 미들웨어 (`checkSubscription`) 연결 필수
