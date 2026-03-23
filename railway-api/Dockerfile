# 파낸 AI API — Python 3.11 기반 Docker 이미지
FROM python:3.11-slim

WORKDIR /app

# 의존성 먼저 복사하여 레이어 캐시 활용
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 헬스체크 — Railway 배포 상태 확인
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# 앱 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
