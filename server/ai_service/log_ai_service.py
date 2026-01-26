from __future__ import annotations

import os
import json
import re
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

SYSTEM_PROMPT = """You are a Security AI. 
Your ONLY job is to check the log against the following CRITERIA list.
Output JSON only.
"""

app = FastAPI(title="HardwareExpress Log AI Service", version="2.0.0")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    device_map="auto",
    torch_dtype=torch.float32, 
    low_cpu_mem_usage=True,
)
model.pad_token_id = tokenizer.eos_token_id

class AnalyzeRequest(BaseModel):
    log_text: str

class AnalyzeResponse(BaseModel):
    classification: str

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_NAME}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_log(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        print(f"\n[AI] Analyzing log...", flush=True)

        prompt_content = f"""
        ANALYZE THIS LOG:
        {request.log_text}

        CHECK THESE SPECIFIC CRITERIA:
        1. SQL Injection: Does it contain "' OR", "UNION SELECT", "1=1", or "--"?
        2. XSS: Does it contain "<script>", "javascript:", or "alert("?
        3. Suspicious Time: Is the time between 23:00 and 05:00?
        4. Brute Force: Does the description say "Too many failed attempts"?

        INSTRUCTIONS:
        - If ANY of the above are TRUE -> return {{"classification": "ANOMALOUS"}}
        - If NONE are true (even if user is admin) -> return {{"classification": "NORMAL"}}

        RESPONSE:
        """

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt_content},
        ]

        input_ids = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt",
        ).to(model.device)

        attention_mask = torch.ones_like(input_ids)

        outputs = model.generate(
            input_ids,
            attention_mask=attention_mask,
            max_new_tokens=20,
            do_sample=False,
            pad_token_id=model.pad_token_id,
        )

        generated_tokens = outputs[0][input_ids.shape[1]:]
        response_text = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()
        
        print(f"[AI] Raw Output: {response_text}", flush=True)

        classification = "NORMAL"
        
        if "ANOMALOUS" in response_text.upper():
             classification = "ANOMALOUS"
        elif "NORMAL" in response_text.upper():
             classification = "NORMAL"
        
        return AnalyzeResponse(classification=classification)

    except Exception as e:
        print(f"Error: {str(e)}", flush=True)
        return AnalyzeResponse(classification="NORMAL")


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("AI_SERVICE_HOST", "127.0.0.1")
    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    uvicorn.run(app, host=host, port=port)