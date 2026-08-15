"""
RadScan AI Backend REST API
Powered by FastAPI, PyTorch 2.5D Volumetric MRI Engine, and GCP Vertex AI Gemini 1.5 Pro.
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
    allow_credentials=True,
    allow_methods=["*"],
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
        "cloud": "GCP Cloud Run (L4 GPU Scale-to-Zero)",
        "llm_engine": "Vertex AI Gemini 1.5 Pro",
        "model": "2.5D Volumetric CNN-BiGRU (819k DICOM Trained)",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI uvicorn",
        "gcp_project": settings.GCP_PROJECT_ID,
        "vertex_ai": "active",
        "model_device": model_engine.device
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

@app.post("/api/v1/predict")
async def predict_mri(
    sample_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Runs 2.5D Volumetric MRI Inference & Grad-CAM Heatmap Generation.
    Accepts either a 1-click sample_id OR a custom DICOM file upload.
    """
    if sample_id:
        try:
            result = model_engine.predict_sample(sample_id)
            return result
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    elif file:
        file_bytes = await file.read()
        result = model_engine.predict_custom_dicom(file.filename, file_bytes)
        return result
    else:
        # Default fallback to sample-acl-tear if neither provided
        return model_engine.predict_sample("sample-acl-tear")

@app.post("/api/v1/report")
def generate_report(req: ReportRequest):
    """
    Generates structured radiology clinical report and patient summary via Vertex AI Gemini 1.5 Pro.
    """
    input_data = req.model_dump()
    report = gemini_report_generator.generate_report(input_data)
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
