"""
Log AI Microservice

Receives log text, sends it to a Hugging Face model, and returns a score/label.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
    from transformers import pipeline
except Exception:  # pragma: no cover - handled at runtime
    pipeline = None


MODEL_NAME = os.getenv(
    "HF_MODEL_NAME", "distilbert-base-uncased-finetuned-sst-2-english"
)
SCORE_THRESHOLD = float(os.getenv("AI_SCORE_THRESHOLD", "0.8"))
SUSPICIOUS_LABELS = {
    label.strip()
    for label in os.getenv("AI_SUSPICIOUS_LABELS", "").split(",")
    if label.strip()
}

app = FastAPI(title="HardwareExpress Log AI Service", version="1.0.0")

_model_pipeline = None
_model_error: Optional[str] = None


class AnalyzeRequest(BaseModel):
    log_id: str = Field(..., description="Log ID from logs table")
    text: str = Field(..., description="Flattened log text")
    metadata: Optional[Dict[str, Any]] = None


class AnalyzeResponse(BaseModel):
    model_name: str
    label: str
    score: float
    threshold: float
    is_suspicious: bool
    ai_summary: Optional[str] = None
    raw: Optional[Any] = None


def get_pipeline():
    global _model_pipeline, _model_error
    if _model_pipeline is not None or _model_error is not None:
        return _model_pipeline
    if pipeline is None:
        _model_error = "transformers not available"
        return None
    try:
        _model_pipeline = pipeline(
            "text-classification", model=MODEL_NAME, return_all_scores=True
        )
        return _model_pipeline
    except Exception as exc:
        _model_error = str(exc)
        return None


def pick_top_label(result: Any) -> Dict[str, float]:
    if isinstance(result, list) and result and isinstance(result[0], list):
        candidates = result[0]
    elif isinstance(result, list):
        candidates = result
    else:
        candidates = []

    if not candidates:
        return {"label": "unknown", "score": 0.0}

    top = max(candidates, key=lambda item: item.get("score", 0.0))
    return {
        "label": str(top.get("label", "unknown")),
        "score": float(top.get("score", 0.0)),
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_log(request: AnalyzeRequest) -> AnalyzeResponse:
    pipe = get_pipeline()
    if pipe is None:
        detail = _model_error or "model not initialized"
        raise HTTPException(status_code=503, detail=detail)

    result = pipe(request.text, truncation=True)
    top = pick_top_label(result)
    label = top["label"]
    score = top["score"]

    if SUSPICIOUS_LABELS:
        is_suspicious = score >= SCORE_THRESHOLD and label in SUSPICIOUS_LABELS
    else:
        is_suspicious = score >= SCORE_THRESHOLD

    summary = f"label={label}, score={score:.3f}"

    return AnalyzeResponse(
        model_name=MODEL_NAME,
        label=label,
        score=score,
        threshold=SCORE_THRESHOLD,
        is_suspicious=is_suspicious,
        ai_summary=summary,
        raw=result,
    )


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("AI_SERVICE_HOST", "127.0.0.1")
    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    uvicorn.run(app, host=host, port=port)
