from ..models.pet import Pet, React

def update_pet_status(pet: Pet, new_react: React) -> Pet:
    current_react_description = (
        f"Emotion: {new_react.emotion}, "
        f"Level: {new_react.level}, "
        f"Movement: {new_react.movement}, "
        f"Physical_status: {new_react.physical_status}, "
        f"Mental_status: {new_react.mental_status}"
    )
    
    return Pet(
        gender=pet.gender,
        age=pet.age,
        personalities=pet.personalities,
        physical_status=new_react.physical_status,
        mental_status=new_react.mental_status,
        current_react=current_react_description
    )
