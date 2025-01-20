from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import pet
from .config.settings import get_settings

settings = get_settings()

app = FastAPI(title="Pet Simulator API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include routers
app.include_router(pet.router, prefix="/pet", tags=["pet"])