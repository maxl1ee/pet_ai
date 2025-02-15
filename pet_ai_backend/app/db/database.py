from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.config.settings import get_settings
import logging
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

settings = get_settings()
logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

    async def connect_to_database(self):
        """Create database connection."""
        try:
            self.client = AsyncIOMotorClient(
                settings.mongodb_uri,
                serverSelectionTimeoutMS=5000  # 5 second timeout
            )
            
            # Verify the connection
            await self.client.admin.command('ping')
            
            # Set the database
            self.db = self.client.pet_database
            
            logger.info("Successfully connected to MongoDB")
            
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
        except ServerSelectionTimeoutError as e:
            logger.error(f"Server selection timeout: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error while connecting to MongoDB: {e}")
            raise

    async def close_database_connection(self):
        """Close database connection."""
        try:
            if self.client:
                self.client.close()
                self.db = None
                logger.info("MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {e}")
            raise

    async def check_connection(self) -> bool:
        """Check if database connection is alive."""
        try:
            if self.client:
                await self.client.admin.command('ping')
                return True
            return False
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            return False

    def get_database(self):
        """Get database instance."""
        if not self.db:
            raise ConnectionError("Database not initialized. Call connect_to_database first.")
        return self.db

# Create a global database instance
db = Database()