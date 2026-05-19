from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


def get_allowed_origins() -> list[str]:
    origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173"
    )

    return [
        origin.strip()
        for origin in origins.split(",")
        if origin.strip()
    ]


class Settings(BaseModel):
    APP_NAME: str = "Market Insight AI"
    APP_VERSION: str = "1.0.0"

    ALLOWED_ORIGINS: list[str] = get_allowed_origins()

    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


settings = Settings()