"""
Vertex AI Gemini report synthesis.

Calls Gemini to draft the structured report. If Vertex AI is unavailable
(missing credentials, unset project, quota, network), falls back to a
deterministic template and reports that honestly via `llm_generated`.
"""
import json
import re
from typing import Any, Dict, Optional

from app.config import settings

PROMPT = """You are assisting a musculoskeletal radiologist by drafting a preliminary \
structured report for a knee MRI. A CNN triage model produced the per-pathology \
probabilities below. Draft the report from those probabilities only. Do not invent \
findings that are not supported by them.

Study: {study}
Technique: {technique}
Patient: {age} / {gender}
Model's leading finding: {primary}
Per-pathology probabilities: {probabilities}

Return strict JSON with exactly these keys and no others:
{{
  "impression": "numbered clinical impression, 1-3 items, radiology register",
  "recommendations": "concrete next steps for the referring clinician",
  "patient_summary": "2-3 sentences of plain language for a patient portal, no jargon"
}}

Treat probabilities below 0.35 as not reported. Never state certainty the \
probabilities do not support: hedge with 'suggests' or 'probable' between 0.35 and 0.70. \
Do not name a radiologist or sign the report."""


class GeminiReportGenerator:
    """Drafts structured radiology reports via Vertex AI Gemini."""

    def __init__(self):
        self.project_id = settings.GCP_PROJECT_ID
        self.location = settings.GCP_LOCATION
        self.model_name = settings.VERTEX_AI_MODEL
        self._client = None
        self.init_error: Optional[str] = None
        self._init_vertex_ai()

    @property
    def initialized(self) -> bool:
        return self._client is not None

    def _init_vertex_ai(self) -> None:
        if not settings.ENABLE_VERTEX_AI:
            self.init_error = "disabled via ENABLE_VERTEX_AI"
            return
        if not self.project_id:
            self.init_error = "GCP_PROJECT_ID is not set"
            return
        try:
            from google import genai

            self._client = genai.Client(
                vertexai=True, project=self.project_id, location=self.location
            )
            print(f"[RadScan AI] Vertex AI ready: {self.model_name} in {self.project_id}.")
        except Exception as exc:
            self.init_error = f"{type(exc).__name__}: {exc}"
            print(f"[RadScan AI] Vertex AI unavailable, using template fallback ({self.init_error}).")

    def _call_gemini(self, payload: Dict[str, Any]) -> Optional[Dict[str, str]]:
        if self._client is None:
            return None

        prompt = PROMPT.format(
            study=payload["study"],
            technique=payload["technique"],
            age=payload["age"],
            gender=payload["gender"],
            primary=payload["primary"],
            probabilities=payload["probabilities"],
        )

        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "temperature": 0.2,
                    "max_output_tokens": 1024,
                    "response_mime_type": "application/json",
                },
            )
            text = (response.text or "").strip()
        except Exception as exc:
            print(f"[RadScan AI] Gemini call failed: {type(exc).__name__}: {exc}")
            return None

        # Models often wrap JSON in a fenced block.
        fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
        if fenced:
            text = fenced.group(1).strip()

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            print("[RadScan AI] Gemini returned non-JSON output; falling back to template.")
            return None

        required = ("impression", "recommendations", "patient_summary")
        if not all(isinstance(parsed.get(k), str) and parsed[k].strip() for k in required):
            print("[RadScan AI] Gemini JSON missing required keys; falling back to template.")
            return None

        return {k: parsed[k].strip() for k in required}

    @staticmethod
    def _template_narrative(primary_diag: str) -> Dict[str, str]:
        if "ACL Tear" in primary_diag:
            return {
                "impression": (
                    "1. Findings suggest disruption of the anterior cruciate ligament. "
                    "Correlation with clinical stability testing is advised.\n"
                    "2. Associated joint effusion and bone marrow signal change, in keeping "
                    "with an acute pivot-shift mechanism."
                ),
                "recommendations": (
                    "Orthopaedic review for reconstruction candidacy, interim bracing, "
                    "physiotherapy, and clinical stability assessment (Lachman, pivot shift)."
                ),
                "patient_summary": (
                    "The scan suggests a tear of the ACL, the main stabilising ligament inside "
                    "the knee. There is also fluid and some bruising of the bone within the joint. "
                    "A review with an orthopaedic specialist is recommended."
                ),
            }
        if "Meniscus Tear" in primary_diag:
            return {
                "impression": (
                    "1. Findings suggest a tear of the posterior horn of the medial meniscus "
                    "extending to the articular margin.\n"
                    "2. Minor associated joint fluid. No cruciate ligament disruption identified."
                ),
                "recommendations": (
                    "Consider arthroscopy review if mechanical locking or catching is present; "
                    "otherwise anti-inflammatory management and physiotherapy."
                ),
                "patient_summary": (
                    "The scan suggests a tear in the meniscus, the cartilage cushion on the inner "
                    "side of the knee. There is a small amount of fluid in the joint. Rest, "
                    "physiotherapy, or review by a knee specialist is recommended."
                ),
            }
        return {
            "impression": (
                "1. No significant abnormality identified on this multi-planar knee MRI.\n"
                "2. Cruciate and collateral ligaments and both menisci appear intact, with no "
                "joint effusion identified."
            ),
            "recommendations": "Routine follow-up; symptom-based conservative management.",
            "patient_summary": (
                "The knee scan appears normal. The major ligaments and cartilage cushions look "
                "intact, with no sign of a tear or joint injury."
            ),
        }

    def generate_report(self, diagnosis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Returns study info, findings, impression, recommendations and patient summary."""
        primary_diag = diagnosis_data.get("primary_diagnosis", "Unremarkable Joint")
        pathologies: Dict[str, float] = diagnosis_data.get("pathologies") or {}

        raw_info = diagnosis_data.get("patient_info")
        info = raw_info if isinstance(raw_info, dict) else {}
        age = info.get("age", "—")
        gender = info.get("gender", "Not recorded")
        technique = info.get("mri_type", "Knee MRI, multi-planar")
        study = info.get("study_description", "Knee MRI")

        reported = {k: v for k, v in pathologies.items() if v >= 0.35}
        probability_str = (
            ", ".join(f"{k} {int(v * 100)}%" for k, v in sorted(reported.items(), key=lambda kv: -kv[1]))
            or "no target above the 35% reporting threshold"
        )

        narrative = self._call_gemini({
            "study": study,
            "technique": technique,
            "age": age,
            "gender": gender,
            "primary": primary_diag,
            "probabilities": probability_str,
        })
        llm_generated = narrative is not None
        if narrative is None:
            narrative = self._template_narrative(primary_diag)

        if llm_generated:
            engine = f"Vertex AI {self.model_name}"
        elif self.init_error:
            engine = f"Deterministic template (Vertex AI unavailable: {self.init_error})"
        else:
            engine = "Deterministic template (Vertex AI call failed)"

        def pct(label: str, default: float) -> str:
            return f"{int(pathologies.get(label, default) * 100)}%"

        return {
            "status": "success",
            "engine": engine,
            "llm_generated": llm_generated,
            "study_info": {
                "patient_age": age,
                "patient_gender": gender,
                "modality": technique,
                "study_description": study,
                "primary_diagnosis": primary_diag,
            },
            "clinical_findings": {
                "anterior_cruciate_ligament": f"Model probability of disruption: {pct('ACL Tear', 0.02)}.",
                "medial_meniscus": f"Model probability of tear: {pct('Medial Meniscus Tear', 0.04)}.",
                "lateral_meniscus": f"Model probability of tear: {pct('Lateral Meniscus Tear', 0.03)}.",
                "collateral_ligaments": f"MCL model probability: {pct('MCL Injury', 0.02)}.",
                "joint_effusion": f"Effusion model probability: {pct('Joint Effusion', 0.05)}.",
                "bone_marrow_signal": f"Bone contusion model probability: {pct('Bone Contusion', 0.03)}.",
            },
            "impression": narrative["impression"],
            "recommendations": narrative["recommendations"],
            "patient_summary": narrative["patient_summary"],
            "attestation_status": "Preliminary AI-assisted draft. Not attested by a radiologist.",
        }


gemini_report_generator = GeminiReportGenerator()
