from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    google_cloud_project: str
    gcloud_auth_token: str
    mongodb_uri: str
    test_pet_id: str
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
