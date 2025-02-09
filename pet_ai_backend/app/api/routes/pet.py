from fastapi import APIRouter, HTTPException
import httpx

from app.config.settings import get_settings
from ...models.pet import Pet, React, InteractionRequest, ImageGenerationRequest, GeneratedImage, ImageResponse
from ...services.pet_service import PetService
from ...core.pet_logic import update_pet_status
from typing import Any
import asyncio

settings = get_settings()

router = APIRouter()
pet_service = PetService()

# Initialize pet state
current_pet = Pet(
    gender="female",
    age=3,
    personalities=["playful", "friendly", "energetic"],
    physical_status="active",
    mental_status="content",
    current_react="Emotion: calm, Level: 5, Movement: sitting quietly"
)

@router.get("/status")
async def get_pet_status():
    return current_pet

@router.post("/interact")
async def interact_with_pet(request: InteractionRequest) -> Any:
    global current_pet
    try:
        new_react = await pet_service.handle_interaction(
            pet=current_pet,
            interaction=request.interaction
        )
        current_pet = update_pet_status(current_pet, new_react)
        return new_react
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from ...core.image_handler import ImageHandler

# Initialize handlers
image_handler = ImageHandler()

@router.post("/generate-image")
async def generate_pet_image(request: ImageGenerationRequest) -> ImageResponse:
    try:
        detailed_prompt = f"{request.base_description}. "
        detailed_prompt += f"The pet is {request.emotion} and {request.movement}."
        
        response = await image_handler.generate_image(detailed_prompt)
        
        if response and 'predictions' in response:
            return ImageResponse(**response)
        else:
            raise HTTPException(status_code=500, detail="Failed to generate image")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
