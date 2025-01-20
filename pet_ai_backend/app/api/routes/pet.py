from fastapi import APIRouter, HTTPException
import httpx

from app.config.settings import get_settings
from ...models.pet import Pet, React, InteractionRequest, ImageGenerationRequest
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

import replicate

@router.post("/generate")
async def generate_image(request: ImageGenerationRequest):
    prompt = f"Duplicate the image provided and generate a single image, and change the pet to {request.movement} with emotion of {request.emotion}"

    try:
        output = replicate.run(
            "black-forest-labs/flux-1.1-pro-ultra",
            input={
                "raw": False,
                "prompt": prompt,
                "image_prompt": request.base_image_url,
                "aspect_ratio": "3:2",
                "output_format": "jpg",
                "safety_tolerance": 2,
                "image_prompt_strength": 0.1
            }
        )
        return {"output": str(output)}
        
    
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    
    