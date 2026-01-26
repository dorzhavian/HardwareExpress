import os
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

app = FastAPI(title="Log AI Service", version="4.0.0")

try:
    print(f"Loading model: {MODEL_NAME}...", flush=True)
    # Token parameter removed
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        device_map="cpu",
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
        trust_remote_code=True
    )
    print("Model loaded successfully!", flush=True)
except Exception as e:
    print(f"Error loading model: {str(e)}")
    exit(1)


class AnalyzeRequest(BaseModel):
    log_text: str


class AnalyzeResponse(BaseModel):
    classification: str


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_log(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        messages = [
            {
                "role": "system",
                "content": "You are a security analyst. Classify the log as 'NORMAL' or 'ANOMALOUS'. Rules: SQLi/XSS/Suspicious Time/Failed Login -> ANOMALOUS. Valid traffic -> NORMAL. Do not explain. Return one word only."
            },
            {
                "role": "user",
                "content": f"Log entry: {request.log_text}\n\nClassification:"
            }
        ]

        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

        generated_ids = model.generate(
            model_inputs.input_ids,
            max_new_tokens=5,
            do_sample=False
        )

        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response_text = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip().upper()
        
        print(f"[AI] Raw Output: {response_text}", flush=True)

        classification = "ANOMALOUS" if "ANOMALOUS" in response_text else "NORMAL"
        
        return AnalyzeResponse(classification=classification)

    except Exception as e:
        print(f"Error processing log: {str(e)}", flush=True)
        return AnalyzeResponse(classification="NORMAL")


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("AI_SERVICE_HOST", "127.0.0.1")
    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    uvicorn.run(app, host=host, port=port)