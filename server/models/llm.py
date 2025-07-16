import os
from dotenv import load_dotenv
import requests


# Load environment variables
load_dotenv()

# Configuration
OPENROUTER_GEMMA_API_KEY = os.getenv("OPENROUTER_GEMMA_API_KEY")
BASE_URL="https://openrouter.ai/api/v1"

class OpenRouterLLM:
    def __init__(self, api_key, temperature=0.1):
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "LangChain Integration",
            "Content-Type": "application/json"
        }
        self.temperature = temperature

    def __call__(self, prompt, image_url=None):
        # Convert PromptValue to string if needed
        if hasattr(prompt, 'to_string'):
            prompt = prompt.to_string()
        
        try:
            print(f"Sending request to OpenRouter API...")

            # Build message content
            message_content = []

            message_content.append({
                "type": "text",
                "text": str(prompt)
            })

            if image_url:
                message_content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": image_url
                    }
                })


            response = requests.post(
                f"{BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": "mistralai/mistral-small-3.2-24b-instruct:free",
                    "messages": [{"role": "user", "content": message_content}],
                    "temperature": self.temperature,
                    "max_tokens": 1000,
                    "stream": False
                }
            )

            # Print response for debugging
            print(f"OpenRouter API Response Status: {response.status_code}")

            # Add response validation
            if response.status_code != 200:
                print(f"OpenRouter API Error: {response.status_code} - {response.text}")
                return "Sorry, there was an error with the API request."
                
            response_json = response.json()
            
            # Add error handling for missing data
            if not response_json.get("choices"):
                print(f"Unexpected API response format: {response_json}")
                return "Sorry, received an unexpected response format."

            content = response_json["choices"][0]["message"]["content"]
            # Extract the message content safely
            return content
            
        except Exception as e:
            print(f"Error calling OpenRouter API: {e}")
            return "Sorry, I encountered an error processing your request."


