from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class EmotionType(str, Enum):
    Happy = "happy"
    Sad = "sad"
    Angry = "angry"
    Calm = "calm"

class React(BaseModel):
    emotion: EmotionType
    level: float = Field(ge=0, le=10)
    movement: str
    physical_status: str
    mental_status: str

class Pet(BaseModel):
    gender: str
    age: int
    personalities: List[str]
    physical_status: str
    mental_status: str
    current_react: str

class InteractionRequest(BaseModel):
    interaction: str = Field(..., description="The user's interaction with the pet")

class ImageGenerationRequest(BaseModel):
    emotion: str = Field(..., description="The pet's emotion")
    movement: str = Field(..., description="The pet's movement")
    base_image_url: str = Field(..., description="The pet's image url")

