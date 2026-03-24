"""
파낸 AI API — FastAPI 메인 애플리케이션
금융 개인정보 처리 전용 서비스 (Railway 배포)
"""
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.health import router as health_router
from app.routes.news import router as news_router
from app.routes.sector import router as sector_router
from app.routes.cron import router as cron_router
from app.routes.krx import router as krx_router
from app.routes.dart import router as dart_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """앱 시작/종료 이벤트 핸들러"""
    # 시작 시
    print(f"[파낸 AI API] 서버 시작 — 환경: {settings.railway_environment}")
    yield
    # 종료 시
    print("[파낸 AI API] 서버 종료")


# FastAPI 앱 인스턴스
app = FastAPI(
    title="파낸 AI API",
    version="0.1.0",
    description="파낸 AI 투자 인텔리전스 백엔드 서비스",
    lifespan=lifespan,
)

# CORS 미들웨어 — 허용 오리진 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(health_router)
app.include_router(news_router)
app.include_router(sector_router)
app.include_router(cron_router)
app.include_router(krx_router)
app.include_router(dart_router)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
