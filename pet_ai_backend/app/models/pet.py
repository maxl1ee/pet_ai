from enum import Enum
from typing import List
from pydantic import BaseModel, Field
# Start of pet data model

class EmotionType(str, Enum):
    Happy = "happy"
    Sad = "sad"
    Angry = "angry"
    Calm = "calm"

class Emotion(BaseModel):
    emotion_type: EmotionType
    level: float = Field(ge=0, le=10, description="The pet's emotional level")

class React(BaseModel):
    emotion: Emotion
    movement: str
    physical_status: str
    mental_status: str

class Personality(BaseModel):
    description: str = Field(..., description="The pet's personality description")
    level: float = Field(ge=0, le=10, description="The level of this personality")

class Knowledge(BaseModel):
    description: str = Field(..., description="The pet's knowledge description")
    level: float = Field(ge=0, le=10, description="The level of this knowledge")

class Appearance(BaseModel):
    description: str = Field(..., description="The pet's appearance description")

class Environment(BaseModel):
    description: str = Field(..., description="The pet's environment description")

# Main Pet Model
class Pet(BaseModel):
    id: str = Field(default=None, alias="_id")
    gender: str
    age: int
    personalities: List[Personality]
    current_react: React
    knowledge: Knowledge
    appearance: List[Appearance]  # Make sure this matches exactly
    environment: Environment

# End of pet data model

# Start of API request

class InteractionRequest(BaseModel):
    interaction: str = Field(..., description="The user's interaction with the pet")

class ImageGenerationRequest(BaseModel):
    emotion: str = Field(..., description="The pet's emotion")
    movement: str = Field(..., description="The pet's movement")
    base_description: str = Field(..., description="The pet's base description")
# End of API request

# Start of Image response
class GeneratedImage(BaseModel):
    bytesBase64Encoded: str

class ImageResponse(BaseModel):
    predictions: List[GeneratedImage]
# End of Image response