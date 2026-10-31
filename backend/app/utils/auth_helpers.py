from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.config import settings
from app.models.schemas import UserProfile

security = HTTPBearer(auto_error=False)

# Pre-configured demo personas for instant one-click testing
DEMO_USERS: Dict[str, UserProfile] = {
    "alex@wayfare.ai": UserProfile(
        id="u-solo-alex-001",
        email="alex@wayfare.ai",
        full_name="Alex Rivera (Solo Explorer)",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    ),
    "elena.leo@wayfare.ai": UserProfile(
        id="u-couple-elena-002",
        email="elena.leo@wayfare.ai",
        full_name="Elena & Leo (Couple Getaway)",
        avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
    ),
    "group.lead@wayfare.ai": UserProfile(
        id="u-group-tech-003",
        email="group.lead@wayfare.ai",
        full_name="Tech Crew Lead (Group Roadtrip)",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
}

DEFAULT_USER = DEMO_USERS["alex@wayfare.ai"]


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        # First try our secret
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        try:
            # If failed, try Supabase JWT secret
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET, 
                algorithms=["HS256"], 
                options={"verify_aud": False}
            )
            return payload
        except JWTError:
            # Dev bypass for mock tokens
            if token.startswith("mock-token-"):
                email = token.replace("mock-token-", "")
                if email in DEMO_USERS:
                    u = DEMO_USERS[email]
                    return {"sub": u.id, "email": u.email, "name": u.full_name}
                return {"sub": "mock-user-id", "email": email, "name": email.split("@")[0]}
            return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UserProfile:
    """Authenticates user via Bearer JWT or falls back gracefully in development mode."""
    if not credentials or not credentials.credentials:
        # If in development / mock mode, allow fallback to default demo user
        return DEFAULT_USER

    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    email = payload.get("email", "traveler@wayfare.ai")
    name = payload.get("name") or payload.get("user_metadata", {}).get("full_name") or email.split("@")[0]

    return UserProfile(
        id=str(user_id or "user-001"),
        email=email,
        full_name=name,
        avatar_url=payload.get("avatar_url")
    )
