"""
RadScan AI Backend REST API

Serves benchmark-calibrated triage demo outputs and drafts structured reports via
Vertex AI Gemini, falling back to a deterministic template when Vertex is unavailable.
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.config import settings
from app.sample_data import get_all_samples, get_sample_by_id
from app.model_engine import model_engine
from app.gemini_service import gemini_report_generator

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multimodal AI Radiology Triage & Volumetric MRI Report Generator",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class ReportRequest(BaseModel):
    sample_id: Optional[str] = None
    primary_diagnosis: str
    pathologies: Dict[str, float]
    patient_info: Optional[Dict[str, Any]] = None

@app.get("/")
def read_root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "compute": settings.COMPUTE_TARGET,
        "llm_engine": (
            f"Vertex AI {settings.VERTEX_AI_MODEL}"
            if gemini_report_generator.initialized
            else "Vertex AI unavailable - report drafting uses a deterministic template"
        ),
        "triage_engine": "Benchmark-calibrated demo engine (see /api/v1/models)",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI uvicorn",
        "gcp_project": settings.GCP_PROJECT_ID or None,
        "vertex_ai": "ready" if gemini_report_generator.initialized else "fallback",
        "vertex_ai_error": gemini_report_generator.init_error,
        "compute": settings.COMPUTE_TARGET
    }

@app.get("/api/v1/samples")
def list_samples():
    """Returns list of pre-loaded 1-click test cases for judges."""
    return {"status": "success", "samples": get_all_samples()}

@app.get("/api/v1/samples/{sample_id}")
def get_sample(sample_id: str):
    sample = get_sample_by_id(sample_id)
    if not sample:
        raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found.")
    return {"status": "success", "sample": sample}

@app.get("/api/v1/models")
def list_models():
    """Returns metadata and benchmark comparisons for available AI diagnostic models."""
    return {"status": "success", "models": model_engine.get_models_metadata()}

@app.post("/api/v1/predict")
async def predict_mri(
    sample_id: Optional[str] = Form(None),
    model_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Runs Volumetric MRI Inference & Grad-CAM Heatmap Generation using selected AI model.
    Accepts either a 1-click sample_id OR a custom DICOM file upload, plus optional model_id.
    """
    target_model = model_id or settings.DEFAULT_MODEL
    if sample_id:
        try:
            result = model_engine.predict_sample(sample_id, model_id=target_model)
            return result
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    elif file:
        file_bytes = await file.read()
        result = model_engine.predict_custom_dicom(file.filename, file_bytes, model_id=target_model)
        return result
    else:
        # Default fallback to sample-acl-tear if neither provided
        return model_engine.predict_sample("sample-acl-tear", model_id=target_model)

@app.post("/api/v1/report")
def generate_report(req: ReportRequest):
    """
    Drafts a structured radiology report and patient summary from the model probabilities.
    Uses Vertex AI Gemini when available; the response reports which path was taken via
    the `engine` and `llm_generated` fields.
    """
    input_data = req.model_dump()
    report = gemini_report_generator.generate_report(input_data)
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
