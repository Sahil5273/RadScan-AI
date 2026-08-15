import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RadScan AI"
    API_V1_STR: str = "/api/v1"
    
    # GCP Configuration
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "radscan-ai-prod")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "us-central1")
    VERTEX_AI_MODEL: str = os.getenv("VERTEX_AI_MODEL", "gemini-1.5-pro-002")
    
    # Model Configuration
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/knee_mri_25d_cnn_bigru.pt")
    USE_GPU: bool = os.getenv("USE_GPU", "true").lower() == "true"
    
    class Config:
        case_sensitive = True

settings = Settings()
