# AI Service (FastAPI)

This service analyzes logs with a text-classification model and returns a
minimal summary containing score and sentiment only.

## Requirements
- Python 3.11 or 3.12 (do not use 3.14)
- Windows-friendly virtualenv

## Setup (Windows PowerShell)
```powershell
cd server\ai_service
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Run
```powershell
uvicorn log_ai_service:app --host 127.0.0.1 --port 8001 --reload
```

## Environment Variables
Create `server/ai_service/.env` (optional) with:
```env
AI_SCORE_THRESHOLD=0.8
AI_SUSPICIOUS_LABELS=anomaly,attack,suspicious
HF_ANOMALY_MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english
```

Notes:
- `hf_xet` is optional; remove it from `requirements.txt` if not needed.
- The service loads `.env` from this folder if present.
