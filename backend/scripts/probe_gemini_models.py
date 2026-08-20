"""Probes which Vertex AI Gemini model names this project can actually serve."""
import sys

from google import genai

PROJECT = sys.argv[1] if len(sys.argv) > 1 else "project-777cd363-5fcc-40b7-a84"
LOCATION = sys.argv[2] if len(sys.argv) > 2 else "us-central1"

CANDIDATES = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
]

client = genai.Client(vertexai=True, project=PROJECT, location=LOCATION)

for name in CANDIDATES:
    try:
        response = client.models.generate_content(
            model=name,
            contents="Reply with the single word OK.",
            config={"max_output_tokens": 16},
        )
        print("{}: OK -> {}".format(name, (response.text or "").strip()[:40]))
    except Exception as exc:
        print("{}: FAIL -> {}: {}".format(name, type(exc).__name__, str(exc)[:160]))
