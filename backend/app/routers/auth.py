from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import UserProfile, TokenResponse, LoginRequest
from app.utils.auth_helpers import create_access_token, get_current_user, DEMO_USERS

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    email = req.email.strip().lower()
    
    # Check if matching demo user
    user = DEMO_USERS.get(email)
    if not user:
        # Create user profile on the fly for demo / testing
        name = req.full_name or email.split("@")[0].title()
        user = UserProfile(
            id=f"u-{abs(hash(email)) % 10000:04d}",
            email=email,
            full_name=name,
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
        )
    
    token = create_access_token({"sub": user.id, "email": user.email, "name": user.full_name})
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: UserProfile = Depends(get_current_user)):
    return current_user


@router.get("/demo-personas")
async def get_demo_personas():
    return list(DEMO_USERS.values())
