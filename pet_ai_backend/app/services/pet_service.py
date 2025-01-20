from ..models.pet import Pet, React
from ..core.llm_handler import LLMHandler
from ..core.pet_logic import update_pet_status

class PetService:
    def __init__(self):
        self.llm_handler = LLMHandler()
        
    async def handle_interaction(self, pet: Pet, interaction: str) -> React:
        pet_description = (
            f"Gender: {pet.gender}, "
            f"Age: {pet.age}, "
            f"Personalities: {', '.join(pet.personalities)}, "
            f"Current react: {pet.current_react}"
        )
        
        new_react = await self.llm_handler.get_pet_reaction(
            pet_description=pet_description,
            interaction=interaction
        )
        
        return new_react