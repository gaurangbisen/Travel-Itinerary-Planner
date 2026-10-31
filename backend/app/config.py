import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Wayfare – AI Travel Itinerary Planner"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & AI mode
    ENV: str = "development"
    AI_MODE: str = os.getenv("AI_MODE", "mock")  # "mock" or "gemini"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Supabase (Optional for mock/dev mode, required for Supabase cloud)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "mock-jwt-secret-wayfare-test-key-32chars")
    
    # Server & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "wayfare-super-secret-developer-key-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # SQLite / Storage path for standalone local DB
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "wayfare_local.db")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
