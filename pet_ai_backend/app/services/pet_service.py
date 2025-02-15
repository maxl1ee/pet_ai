from typing import Optional
from bson import ObjectId
from ..models.pet import Pet, React, Emotion, EmotionType
from ..db.database import db
from ..core.llm_handler import LLMHandler


class PetService:
    def __init__(self):
        self.llm_handler = LLMHandler()

    async def get_pet(self, pet_id: str) -> Optional[Pet]:
        """Get a pet by ID."""
        try:
            if db.db is None:
                await db.connect_to_database()
            pet_dict = await db.db.pets.find_one({"_id": ObjectId(pet_id)})

            if pet_dict:
                # Convert ObjectId to string for the _id field
                pet_dict["_id"] = str(pet_dict["_id"])
                return Pet(**pet_dict)
            return None

        except Exception as e:
            print(f"Error retrieving pet: {e}")
            return None

    async def handle_interaction(self, pet: Pet, interaction: str) -> React:
        """Handle interaction with a pet."""
        try:
            pet_description = (
                f"Gender: {pet.gender}\n"
                f"Age: {pet.age}\n"
                f"Personalities: {', '.join([f'{p.description} (level: {p.level})' for p in pet.personalities])}\n"
                f"Current Emotion: {pet.current_react.emotion.emotion_type.value} (level: {pet.current_react.emotion.level})\n"
                f"Current Movement: {pet.current_react.movement}\n"
                f"Physical Status: {pet.current_react.physical_status}\n"
                f"Mental Status: {pet.current_react.mental_status}\n"
                f"Knowledge: {pet.knowledge.description} (level: {pet.knowledge.level})\n"
                f"Appearance: {', '.join([app.description for app in pet.appearance])}\n"
                f"Environment: {pet.environment.description}"
            )

            new_react = await self.llm_handler.get_pet_reaction(
                pet_description=pet_description,
                interaction=interaction
            )
            
            # Update the pet's current reaction in the database
            await self.update_pet_reaction(pet.id, new_react)
            
            return new_react
            
        except Exception as e:
            print(f"Error handling interaction: {e}")
            # Return a default reaction in case of error
            return React(
                emotion=Emotion(
                    emotion_type=EmotionType.Calm,
                    level=5.0
                ),
                movement="Stays still",
                physical_status="Normal",
                mental_status="Neutral"
            )

    async def update_pet_reaction(self, pet_id: str, new_react: React) -> bool:
        """Update pet's current reaction in the database."""
        try:
            if db.db is None:
                await db.connect_to_database()
            result = await db.db.pets.update_one(
                {"_id": ObjectId(pet_id)},
                {"$set": {"current_react": new_react.dict()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating pet reaction: {e}")
            return False