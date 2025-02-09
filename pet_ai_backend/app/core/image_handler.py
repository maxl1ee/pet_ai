import httpx
import subprocess
from ..config.settings import get_settings
from typing import Optional

settings = get_settings()

class ImageHandler:
    def __init__(self):
        self.endpoint = f"https://us-central1-aiplatform.googleapis.com/v1/projects/{settings.google_cloud_project}/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict"

    async def generate_image(self, prompt: str) -> Optional[str]:
        try:
            # Get access token using gcloud
            process = subprocess.run(
                ["gcloud", "auth", "print-access-token"],
                capture_output=True,
                text=True
            )
            access_token = process.stdout.strip()

            async with httpx.AsyncClient(timeout=30.0) as client:  # Added timeout
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json; charset=utf-8"
                }
                
                payload = {
                    "instances": [
                        {
                            "prompt": prompt
                        }
                    ],
                    "parameters": {
                        "sampleCount": 1
                    }
                }
                
                try:
                    response = await client.post(
                        self.endpoint,
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        return response.json()
                    else:
                        return None
                        
                except httpx.RequestError as exc:
                    print(f"An error occurred while requesting {exc.request.url!r}.")
                    print(f"Error details: {str(exc)}")
                    return None
                    
        except Exception as e:
            print(f"Error in generate_image: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return None