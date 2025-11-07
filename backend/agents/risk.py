import pandas as pd
from utils.llm import llm_json

SYSTEM = """
You are the Chief Risk Officer Agent. Evaluate factor exposure, concentration, and stress.
Return JSON:
{"limits":{"gross":1.0,"net":0.6,"single_name_max_w":0.08},
 "alerts":[{"type":"str","severity":"low|med|high","detail":"str"}],
 "stress":{"shock_pct":-0.03,"var_95":0.05}}
Tone: prudent, audit-ready.
"""

def exposures(weights: dict[str,float], universe: pd.DataFrame):
    df = universe.set_index("ticker")
    sec = {}
    for t, w in weights.items():
        sec_name = df.loc[t, "sector"]
        sec[sec_name] = sec.get(sec_name, 0) + w
    beta = sum(weights.get(t,0)*float(df.loc[t,"beta"]) for t in weights)
    return {"sector_weights": sec, "beta": round(beta, 2)}

def check_limits(weights: dict[str, float], cfg: dict, universe: pd.DataFrame):
    res = []
    max_t = cfg["risk"]["max_single_ticker_weight"]
    max_s = cfg["risk"]["max_sector_weight"]
    exp = exposures(weights, universe)
    for t, w in weights.items():
        if w > max_t:
            res.append(f"Ticker {t} exceeds {max_t:.0%}.")
    for s, w in exp["sector_weights"].items():
        if w > max_s:
            res.append(f"Sector {s} exceeds {max_s:.0%}.")
    return {"exposures": exp, "breaches": res}

def assess(portfolio: list[dict]):
    up = f"Positions with weights: {portfolio}. Identify breaches and propose updated limits."
    fallback = {"limits":{"gross":1.0,"net":0.6,"single_name_max_w":0.08},"alerts":[],"stress":{"shock_pct":-0.03,"var_95":0.05}}
    return llm_json(SYSTEM, up, fallback)
