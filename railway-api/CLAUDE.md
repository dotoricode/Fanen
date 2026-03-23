# railway-api/ CLAUDE.md

## FastAPI 프로젝트 구조
```
railway-api/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI 앱 인스턴스, CORS, lifespan
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py      # Pydantic Settings (환경변수)
│   ├── routes/
│   │   ├── __init__.py
│   │   └── health.py      # 헬스체크 엔드포인트
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py        # JWT 인증 미들웨어
│   ├── services/           # 비즈니스 로직 (AI 분석, 데이터 처리)
│   └── models/             # Pydantic 요청/응답 모델
├── requirements.txt
├── Dockerfile
├── .env
└── .gitignore
```

## Python 컨벤션
- 함수/변수: **snake_case**
- 클래스: **PascalCase**
- 상수: **UPPER_SNAKE_CASE**
- 주석: 한국어

## 금융 개인정보 처리 원칙
- **Railway API에서만** 금융 개인정보를 처리한다
- Vercel에 개인정보를 전달하지 않는다
- 포트폴리오, 거래내역, 사용자 식별정보는 이 서비스에서만 처리

## JWT 인증 미들웨어 적용 규칙
- 모든 보호 엔드포인트에 `Depends(get_current_user)` 사용
- Supabase JWT 시크릿으로 HS256 알고리즘 검증
- 공개 엔드포인트 (health 등)에는 인증 미적용

## 실행 명령어
```bash
# 개발 모드 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Docker 빌드 및 실행
docker build -t fanen-api .
docker run -p 8000:8000 fanen-api
```
