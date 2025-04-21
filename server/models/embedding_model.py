import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load environment variables
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class EmbeddingModel:
    def __init__(self, api_key=None):
        self.api_key = api_key or GOOGLE_API_KEY
        self.model = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=self.api_key
        )
    
    def get_embeddings(self, texts):
        """Generate embeddings for the provided texts."""
        if isinstance(texts, str):
            texts = [texts]
        return self.model.embed_documents(texts)