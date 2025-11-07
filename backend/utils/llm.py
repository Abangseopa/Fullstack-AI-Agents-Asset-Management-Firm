import os, json
from openai import OpenAI

MODEL = os.getenv("MODEL_NAME", "gpt-5")
USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"
_client = OpenAI(api_key=os.getenv("MODEL_KEY"))

def llm_json(system_prompt: str, user_prompt: str, fallback: dict):
    if not USE_LLM:
        return fallback
    resp = _client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role":"system","content":system_prompt.strip()},
            {"role":"user","content":user_prompt.strip()}
        ],
        response_format={"type":"json_object"}
    )
    try:
        return json.loads(resp.choices[0].message.content)
    except Exception:
        return fallback
