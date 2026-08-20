import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RadScan AI"
    API_V1_STR: str = "/api/v1"

    # GCP Configuration. GCP_PROJECT_ID must match the deploying project or
    # Vertex AI initialization fails and the report falls back to a template.
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "us-central1")
    VERTEX_AI_MODEL: str = os.getenv("VERTEX_AI_MODEL", "gemini-2.5-flash")
    ENABLE_VERTEX_AI: bool = os.getenv("ENABLE_VERTEX_AI", "true").lower() == "true"

    # Inference runtime. The current engine is CPU-only NumPy/Pillow; there is no
    # GPU-backed PyTorch checkpoint served by this container.
    COMPUTE_TARGET: str = os.getenv("COMPUTE_TARGET", "GCP Cloud Run (CPU)")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "phase1-sagittal-resnet18")

    class Config:
        case_sensitive = True

settings = Settings()
