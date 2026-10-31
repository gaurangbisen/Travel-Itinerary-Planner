from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, trips, itinerary, members, share

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI Travel Itinerary Planner with strict JSON validation, scenario tuning, and real-time cost tracking."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(trips.router, prefix=settings.API_V1_STR)
app.include_router(itinerary.router, prefix=settings.API_V1_STR)
app.include_router(members.router, prefix=settings.API_V1_STR)
app.include_router(share.router, prefix=settings.API_V1_STR)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_mode": settings.AI_MODE,
        "environment": settings.ENV
    }


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "version": settings.VERSION
    }
