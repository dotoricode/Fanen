"""
JWT 인증 미들웨어 — Supabase JWT 검증
모든 보호 엔드포인트에서 Depends(get_current_user) 사용
"""
from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from app.core.config import settings

# JWT 검증 알고리즘
ALGORITHM = "HS256"


def verify_jwt(token: str) -> dict[str, str]:
    """
    Supabase JWT 토큰 검증
    유효하지 않은 토큰이면 HTTPException(401) 발생
    """
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},
        )
        return payload  # type: ignore[return-value]
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 토큰입니다",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_current_user(
    authorization: str | None = Header(None),
) -> dict[str, str]:
    """
    FastAPI Depends 의존성 함수 — 현재 인증된 사용자 반환
    Authorization 헤더에서 Bearer 토큰을 추출하여 검증

    사용 예:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            return {"user_id": user["sub"]}
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 헤더가 필요합니다",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # "Bearer <token>" 형식에서 토큰 추출
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="잘못된 인증 헤더 형식입니다. 'Bearer <token>' 형식이어야 합니다",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    return verify_jwt(token)
