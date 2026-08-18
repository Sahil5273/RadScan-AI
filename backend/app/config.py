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
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "model-2.5d-bigru")
    MODEL_PATH_BIGRU: str = os.getenv("MODEL_PATH_BIGRU", "models/knee_mri_25d_cnn_bigru.pt")
    MODEL_PATH_SWIN: str = os.getenv("MODEL_PATH_SWIN", "models/knee_mri_3d_swin_unetr.pt")
    USE_GPU: bool = os.getenv("USE_GPU", "true").lower() == "true"

    class Config:
        case_sensitive = True

settings = Settings()
