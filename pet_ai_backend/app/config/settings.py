from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    replication_api_key: str
    environment: str
    api_host: str
    api_port: int

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
