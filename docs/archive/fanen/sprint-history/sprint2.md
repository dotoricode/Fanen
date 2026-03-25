# Sprint 2 — AI 분석 API 구축

## 목표
뉴스 영향 분석과 섹터 인과관계 분석 API를 구현한다. Gemini API와 Redis 캐시를 연동해 실시간 AI 분석을 제공한다.

## 구현 내용

### `POST /api/news/analyze`
- 뉴스 헤드라인 목록을 입력받아 AI 분석 결과 반환
- Gemini API로 영향도 점수, 요약, 관련 섹터/종목 추출
- Redis 캐시 (TTL 1시간) — 동일 헤드라인 재분석 방지
- 응답 형식: `{ results: [{ headline, impact_score, ai_summary, source_url, affected_sectors, affected_stocks }] }`

### `POST /api/sector/causal`
- 섹터 간 인과관계 분석 요청
- Gemini API로 from_sector → to_sector 영향 강도 산출
- 분석 결과를 Supabase `sector_causal_maps` 테이블에 저장
- 응답 형식: `{ causal_maps: [{ from_sector, to_sector, causal_strength, description }] }`

### Gemini 통합
- `google-generativeai` SDK 사용
- 금융 분석 전용 프롬프트 템플릿 (환각 방지 지침 포함)
- AI 생성 수치는 KRX·DART 데이터와 교차 검증

### Redis 캐시
- Upstash Redis 연결
- 캐시 키: `news_analyze:{headline_hash}`
- 캐시 미스 시 Gemini API 호출 후 저장

## 주요 파일

| 파일 | 설명 |
|------|------|
| `railway-api/routers/news.py` | 뉴스 분석 라우터 |
| `railway-api/routers/sector.py` | 섹터 인과관계 라우터 |
| `railway-api/services/gemini.py` | Gemini API 클라이언트 |
| `railway-api/services/cache.py` | Redis 캐시 서비스 |

## Supabase 테이블
- `news_impacts` — 뉴스 분석 결과 저장 (RLS 활성화)
- `sector_causal_maps` — 섹터 인과관계 데이터 저장 (RLS 활성화)
