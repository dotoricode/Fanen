# Sprint 1 — 백엔드 기반 구축

## 목표
FastAPI 기반 Railway 서버 초기 구축. 인증 미들웨어와 헬스 엔드포인트를 제공해 이후 AI API의 기반을 마련한다.

## 구현 내용

### FastAPI 서버 (`railway-api/`)
- `main.py` — FastAPI 앱 초기화, CORS 설정, 라우터 등록
- 서울 리전(Railway) 배포 설정

### 인증 미들웨어
- Supabase JWT 토큰 검증 미들웨어
- Bearer 토큰 추출 및 사용자 ID 바인딩
- 미인증 요청 401 반환

### 헬스 엔드포인트
- `GET /health` — 서버 상태 확인
- `GET /` — API 버전 정보 반환

## 주요 파일

| 파일 | 설명 |
|------|------|
| `railway-api/main.py` | FastAPI 앱 진입점 |
| `railway-api/middleware/auth.py` | JWT 인증 미들웨어 |
| `railway-api/routers/health.py` | 헬스체크 라우터 |

## 기술 결정
- Railway 서울 리전 고정 — 금융 개인정보 국내 보관 요건
- Supabase JWT 직접 검증 — 별도 Auth 서버 없이 사용자 식별
