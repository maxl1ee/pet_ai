from fastapi import APIRouter, HTTPException
import httpx
from typing import Any, List

from app.config.settings import get_settings
from ...models.pet import (
    Pet, React, InteractionRequest, ImageGenerationRequest, ImageResponse,
    Emotion, EmotionType, Personality, Knowledge, Appearance, Environment
)
from ...services.pet_service import PetService
from ...core.image_handler import ImageHandler

from fastapi import APIRouter, Depends, HTTPException
from ...services.pet_service import PetService
from ...models.pet import Pet, React, InteractionRequest
from motor.motor_asyncio import AsyncIOMotorDatabase
from ...db.database import db
from ...services.utils import format_pet_prompt

router = APIRouter()


@router.get("/{pet_id}/status")
async def get_pet_status(pet_id: str,pet_service: PetService = Depends()):
    pet = await pet_service.get_pet(pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@router.post("/{pet_id}/interact", response_model=React)
async def interact_with_pet(
    pet_id: str,
    interaction: InteractionRequest,
    pet_service: PetService = Depends()
):
    """Handle an interaction with a pet."""
    try:
        # Get the pet
        pet = await pet_service.get_pet(pet_id)
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        
        # Handle the interaction
        new_react = await pet_service.handle_interaction(
            pet=pet,
            interaction=interaction.interaction
        )
        
        return new_react
        
    except Exception as e:
        print(f"Error in interact_with_pet: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{pet_id}/generate-image")
async def generate_pet_image(pet_id: str, pet_service: PetService = Depends()) -> ImageResponse:
    """Generate image based on pet's current state"""
    try:
        pet = await pet_service.get_pet(pet_id)
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        
        detailed_prompt = format_pet_prompt(pet)

        image_handler = ImageHandler()
        response = await image_handler.generate_image(detailed_prompt)
        
        if response and 'predictions' in response:
            return ImageResponse(**response)
        else:
            raise HTTPException(status_code=500, detail="Failed to generate image")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/debug")
async def debug_database():
    try:
        if db.db is None:
            await db.connect_to_database()
        
        # List all collections
        collections = await db.db.list_collection_names()
        
        # Count documents in pets collection
        pet_count = await db.db.pets.count_documents({})
        
        # Get first pet for verification
        first_pet = await db.db.pets.find_one()
        
        return {
            "collections": collections,
            "pet_count": pet_count,
            "first_pet": str(first_pet) if first_pet else None,
            "database_name": db.db.name
        }
    except Exception as e:
        return {"error": str(e)}