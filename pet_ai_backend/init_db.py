# init_db.py
import motor
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime

# MongoDB connection URI
MONGODB_URL = "mongodb+srv://pet_ai_service:pet_ai_service@cluster0.9krif.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Initial pet data
initial_pet = {
    "gender": "female",
    "age": 2,
    "personalities": [
        {
            "description": "Playful and energetic",
            "level": 8.0
        },
        {
            "description": "Affectionate",
            "level": 7.5
        },
        {
            "description": "Intelligent",
            "level": 9.0
        }
    ],
    "current_react": {
        "emotion": {
            "emotion_type": "happy",
            "level": 7.0
        },
        "movement": "Relaxed posture",
        "physical_status": "Healthy and active",
        "mental_status": "Alert and calm"
    },
    "knowledge": {
        "description": "Basic commands and social interactions",
        "level": 6.0
    },
    "appearance": [
        {
            "description": "Sleek black fur with white chest"
        },
        {
            "description": "Bright yellow eyes"
        },
        {
            "description": "Medium size with graceful movements"
        }
    ],
    "environment": {
        "description": "Comfortable indoor space with window views and climbing areas"
    },
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}

async def init_database():
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client.pet_database  # You can change the database name if needed
        
        # Create indexes
        await db.pets.create_index("gender")
        await db.pets.create_index("age")
        
        # Check if collection is empty
        count = await db.pets.count_documents({})
        
        if count == 0:
            # Insert initial pet data
            result = await db.pets.insert_one(initial_pet)
            print(f"Created initial pet with ID: {result.inserted_id}")
        else:
            print(f"Database already contains {count} pets. Skipping initialization.")
        
        # Verify the data
        pet = await db.pets.find_one({"gender": "female"})
        if pet:
            print("\nSuccessfully verified pet data:")
            print(f"Pet ID: {pet['_id']}")
            print(f"Gender: {pet['gender']}")
            print(f"Age: {pet['age']}")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    # Run the initialization
    asyncio.run(init_database())