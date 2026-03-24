"""
DART OpenAPI 클라이언트
금융감독원 DART 공시 API 연동 (opendart.fss.or.kr)
API 키 미설정 시 빈 배열 반환
"""
import httpx
from typing import Dict

from app.core.config import settings

# DART OpenAPI 공시 목록 조회 엔드포인트
DART_API_URL = "https://opendart.fss.or.kr/api/list.json"


async def get_disclosure(code: str, limit: int = 5) -> Dict:
    """
    DART 공시 목록 조회
    - code: 종목코드 (6자리)
    - limit: 최대 건수 (기본 5)
    - DART_API_KEY 미설정 시 빈 배열 반환
    """
    if not settings.DART_API_KEY:
        return {"code": code, "disclosures": [], "cached": False}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(DART_API_URL, params={
                "crtfc_key": settings.DART_API_KEY,
                "stock_code": code,
                "page_count": limit,
                "page_no": 1,
            })
            if resp.status_code != 200:
                return {"code": code, "disclosures": [], "cached": False}

            data = resp.json()
            items = data.get("list", [])[:limit]
            disclosures = [
                {
                    "title": item.get("report_nm", ""),
                    "date": item.get("rcept_dt", ""),
                    "url": f"https://dart.fss.or.kr/dsaf001/main.do?rcpNo={item.get('rcept_no', '')}",
                    "type": _classify_type(item.get("report_nm", "")),
                }
                for item in items
            ]
            return {"code": code, "disclosures": disclosures, "cached": False}
    except Exception:
        return {"code": code, "disclosures": [], "cached": False}


def _classify_type(title: str) -> str:
    """공시 제목으로 유형 분류"""
    if any(k in title for k in ["사업보고서", "분기보고서", "반기보고서"]):
        return "실적"
    if any(k in title for k in ["주요사항", "공시", "결정"]):
        return "공시"
    return "기타"
