from utils.llm import llm_json

SYSTEM = """
You are the Portfolio Construction Agent. Combine signals with risk constraints to propose target weights.
Constraints: sum(w)=1, |w|<= single_name_max_w, sector neutrality within +/-5%.
Return JSON: {"targets":[{"ticker":"", "weight":0.0, "reason":""}]}.
Tone: explicit, trade-off aware.
"""

def propose_targets(tickers: list[str], signals: dict, risk_limits: dict):
    up = f"Tickers:{tickers}\nSignals:{signals}\nRisk:{risk_limits}\nBuild targets within constraints."
    ew = 1/len(tickers) if tickers else 0
    fallback = {"targets":[{"ticker":t,"weight":ew,"reason":"equal-weight stub"} for t in tickers]}
    return llm_json(SYSTEM, up, fallback)
