def format_pet_prompt(pet):
    # Core appearance and identity
    base_description = f"A {pet.gender} pet with {', '.join([app.description for app in pet.appearance])}. "
    
    # Emotional and behavioral state
    emotional_state = f"The pet is feeling {pet.current_react.emotion.emotion_type.value} "
    emotional_state += f"(intensity level: {pet.current_react.emotion.level}). "
    emotional_state += f"Currently {pet.current_react.movement}. "
    
    # Physical and mental condition
    condition = f"The pet appears {pet.current_react.physical_status} physically "
    condition += f"and {pet.current_react.mental_status} mentally. "
    
    # Personality and traits
    personality = "Personality traits: "
    personality += ', '.join([f'{p.description} (level {p.level})' for p in pet.personalities])
    personality += ". "
    
    # Environment and context
    environment = f"Scene: {pet.environment.description}"

    pov = f"Viewing from the front of the environment as the owner's point of view, the pet is in the middle of the screen"
    
    emotional_booster = f"""Make the dog look a bit drastic to increase the emotional fluctuations of users, e.g., if the pet is
                        happy, make it look a bit bitchy and when it's sad, make it look sooooo sad. Every emotion should be
                        put more focus on by the facial expression or his motion."""
    # Combine all elements
    detailed_prompt = (
        f"{base_description}\n"
        f"{emotional_state}\n"
        f"{condition}\n"
        f"{personality}\n"
        f"{environment}"
        f"{pov}"
        f"{emotional_booster}"
    )
    
    return detailed_prompt
