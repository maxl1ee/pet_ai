from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from ..config.settings import get_settings
from ..models.pet import React, EmotionType

settings = get_settings()

class LLMHandler:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            api_key=settings.openai_api_key
        )
        # Set up the parser
        self.parser = PydanticOutputParser(pydantic_object=React)
        
        # Create the prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                """Given a pet with characteristics and current status:\n{pet_description}\n, answer with a pet's reaction to the user's act with it.
                Note that status shouldn't change too drastically for example from irritated to extreme happy, there should be a transfer
                period to go through calmness between extreme emotion/status. 
                Also make the dog's reaction even more drastic to increase the emotional fluctuations of users, e.g., if the pet is menat to feel
                happy, make it look a bit bitchy/funny/funky and when it's sad, make it look sooooo sad/crying/something that will make a person feel bad. 
                Every emotion should be more detailed described through the facial expression or the motion
                Wrap the output in `json` tags\n{format_instructions}""",
            ),
            ("human", "{interaction}"),
        ]).partial(format_instructions=self.parser.get_format_instructions())
        
        # Create the chain
        self.chain = self.prompt | self.llm | self.parser

    async def get_pet_reaction(self, pet_description: str, interaction: str) -> React:
        try:
            # Get the reaction from the model using the chain
            result = await self.chain.ainvoke({
                "interaction": interaction,
                "pet_description": pet_description
            })
            
            return result
            
        except Exception as e:
            # Log the error (you might want to add proper logging)
            print(f"Error in get_pet_reaction: {str(e)}")
            # Return a default reaction in case of error
            return React(
                emotion=EmotionType.Calm,
                level=5,
                movement="stays still, seems confused",
                physical_status="normal",
                mental_status="neutral"
            )