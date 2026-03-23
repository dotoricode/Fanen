"""
헬스체크 엔드포인트 — Railway 배포 상태 확인용
인증 불필요 (공개 엔드포인트)
"""
from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """서버 상태 확인 — Railway 및 Docker 헬스체크에서 호출"""
    return {
        "status": "ok",
        "service": "fanen-api",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
