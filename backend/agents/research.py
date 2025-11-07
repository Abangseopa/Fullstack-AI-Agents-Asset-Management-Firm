from utils.llm import llm_json

SYSTEM = """
You are the Research Alpha Signal Agent at an institutional asset manager.
You synthesize fundamentals, macro context, and market microstructure.
Return continuous scores in [-1,1] for valuation, momentum, and quality per ticker, with brief rationale.
Output JSON only:
{"scores":[{"ticker":"", "valuation":0.0, "momentum":0.0, "quality":0.0, "note":""}], "asof":"YYYY-MM-DD"}.
Tone: professional and concise.
"""

def generate_signals(tickers: list[str]) -> dict:
    up = f"Tickers: {tickers}. Provide signals and one-line notes."
    fallback = {
        "scores": [
            {"ticker": t, "valuation": 0.1, "momentum": 0.1, "quality": 0.1, "note": "stub"}
            for t in tickers
        ],
        "asof": "2025-01-01"
    }
    return llm_json(SYSTEM, up, fallback)
