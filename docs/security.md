# 파낸 (Fanen) — 보안 체크리스트

> 마지막 업데이트: 2026-03-24
> 작업 시 보안 이슈가 추가/해결되면 이 문서를 업데이트한다.

---

## 현재 보안 상태 요약

| 심각도 | 항목 | 상태 |
|--------|------|------|
| 🔴 심각 | `railway-api/.env` gitignore 누락 | ✅ 2026-03-24 수정 완료 |
| 🟠 경고 | CORS allow_methods/allow_headers 와일드카드 | ⏳ 프로덕션 배포 전 필요 |
| 🟠 경고 | Rate Limiting 미구현 | ⏳ Sprint 4 전 추가 권장 |
| 🟡 주의 | CRON_SECRET 환경변수 미설정 | ⏳ 배포 전 설정 필요 |
| 🟢 양호 | JWT 인증 미들웨어 (Bearer 검증) | ✅ 구현 완료 |
| 🟢 양호 | Supabase RLS | ✅ 활성화됨 |
| 🟢 양호 | 금융 민감 데이터 Railway 전용 처리 | ✅ 원칙 준수 |

---

## 프로덕션 배포 전 필수 체크리스트

### 1. CORS 설정 강화
**파일**: `railway-api/app/main.py`

현재 와일드카드(`*`)로 모든 메서드/헤더를 허용하고 있다. 프로덕션에서는 명시적으로 제한해야 한다.

```python
# 현재 (개발용)
allow_methods=["*"],
allow_headers=["*"],

# 변경 목표 (프로덕션)
allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allow_headers=["Authorization", "Content-Type", "X-Cron-Secret"],
```

또한 `allow_origins`도 프로덕션 도메인으로 고정해야 한다:
```
ALLOWED_ORIGINS=https://fanen.vercel.app
```

### 2. Rate Limiting 미들웨어 추가
**파일**: `railway-api/app/main.py` (또는 별도 미들웨어 파일)

Railway API는 금융 데이터를 처리하므로 과도한 요청을 제한해야 한다.

권장 라이브러리: `slowapi` (FastAPI 용 rate limiter)

```bash
pip install slowapi
```

```python
# 구현 예시
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 엔드포인트에 적용
@router.post("/api/news/analyze")
@limiter.limit("30/minute")
async def analyze_news(request: Request, ...):
    ...
```

### 3. CRON_SECRET 환경변수 설정
**파일**: `railway-api/.env` (로컬), Railway 대시보드 (프로덕션)

```bash
# 안전한 랜덤 시크릿 생성
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

생성된 값을 `.env`의 `CRON_SECRET=` 에 추가하고, Railway 대시보드 환경변수에도 동일하게 설정한다.

---

## 환경변수 관리 원칙

| 파일 | git 포함 여부 | 용도 |
|------|-------------|------|
| `.env.local` | ❌ 제외 | Next.js 로컬 개발용 |
| `railway-api/.env` | ❌ 제외 | FastAPI 로컬 개발용 |
| `.env.example` | ✅ 포함 | 키 목록만 (값 없음) |
| `railway-api/.env.example` | ✅ 포함 | 키 목록만 (값 없음) |

> **주의**: 실제 API 키/시크릿이 담긴 파일은 절대 git에 커밋하지 않는다.
> git에 올라간 키는 즉시 폐기하고 재발급해야 한다.

---

## 알려진 잠재 취약점 추적

| 발견일 | 위치 | 내용 | 조치 |
|--------|------|------|------|
| 2026-03-24 | `.gitignore` | `railway-api/.env` 미제외 — Service Role Key 노출 위험 | ✅ gitignore 추가로 해결 |

---

## Supabase RLS 점검 대상

아래 테이블의 RLS 정책은 프로덕션 배포 전 반드시 재검토한다.

| 테이블 | 분류 | 정책 확인 여부 |
|--------|------|---------------|
| `profiles` | 사용자 데이터 | ⏳ 미검토 |
| `portfolios` | 사용자 데이터 | ⏳ 미검토 |
| `news_impacts` | 공개 | ⏳ 미검토 |
| `sector_causal_maps` | 공개 | ⏳ 미검토 |
| `mock_seasons` | 공개 | ⏳ 미검토 |
| `dividend_calendar` | 공개 | ⏳ 미검토 |
