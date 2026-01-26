# AI Anomaly Detection Service (Llama 3.2)

This service is a core component of the HardwareExpress cybersecurity infrastructure. It uses an **LLM-as-a-Judge** approach to identify malicious patterns in backend request logs.

## 🚀 Overview
Unlike traditional keyword-based systems, this service leverages **meta-llama/Llama-3.2-3B-Instruct** running locally to semantically analyze logs. It classifies interactions as either `NORMAL` or `ANOMALOUS` based on security principles defined in a Cybersecurity System Prompt.

## 🛠️ Requirements
- **Python**: 3.11 or 3.12 (Recommended).
- **Hugging Face Account**: Access must be granted for Llama 3.2 models on the Hugging Face Hub.
- **Hardware**: GPU with 8GB+ VRAM is recommended (uses CUDA). Fallback to CPU is supported but slower.

## 📦 Setup (Windows PowerShell)

1. **Navigate to the service directory**:
   ```powershell
    cd server/ai_service
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    ``
2. **Add login token from HF**
    - Obtain a Read Token from Hugging Face Settings.
    - Login via terminal using the hf alias or the direct path:
    ```powershell
        # Use the full path to hf.exe if it's not in your PATH:
        PATH of "hf.exe" auth login
    ``
    -Paste your token when prompted (input will be hidden).

3. **Configuration**
    The service is designed to be zero-config for thresholds. Create a .env file if you need to specify the Hugging Face token:
        HF_TOKEN=your_huggingface_token_here


4. **Execution**
    Start the FastAPI server:
    ```powershell
        uvicorn log_ai_service:app --host 127.0.0.1 --port 8000 --reload
    ``

