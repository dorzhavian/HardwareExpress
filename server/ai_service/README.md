# AI Anomaly Detection Service (Qwen2.5)

This service is a core component of the HardwareExpress cybersecurity infrastructure. It uses an **LLM-as-a-Judge** approach to identify malicious patterns in backend request logs.

## Overview
Unlike traditional keyword-based systems, this service leverages **Qwen/Qwen2.5-1.5B-Instruct** running locally to semantically analyze logs. It classifies interactions as either `NORMAL` or `ANOMALOUS` based on security principles defined in a Cybersecurity System Prompt.

## Requirements
- **Python**: 3.11 or 3.12 (Recommended).
- **Hugging Face Account**: Access must be granted for Llama 3.2 models on the Hugging Face Hub.
- **Hardware**: GPU with 8GB+ VRAM is recommended (uses CUDA). Fallback to CPU is supported but slower.

## Setup

1. **Navigate to the service directory**:
    cd server/ai_service
    py -[your version] -m venv .venv

    # Windows PowerShell
    .\.venv\Scripts\Activate.ps1
    # Windows CMD
    .\.venv\Scripts\activate
    # macOS/Linux
    source .venv/bin/activate

    # Install dependencies
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt



