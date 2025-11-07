import os, json, pandas as pd, yaml
from fastapi import FastAPI
from pydantic import BaseModel
from agents import research, risk, rebalance, execution, compliance

app = FastAPI(title="AI Asset Management (Agents)")

BASE = os.path.dirname(__file__)
CFG = yaml.safe_load(open(os.path.join(BASE,"config.yaml")))
UNIV = pd.read_csv(os.path.join(BASE,"data","universe.csv"))
DEMO = json.load(open(os.path.join(BASE,"data","demo_portfolios.json")))

class ScoreReq(BaseModel):
    client_id: str

@app.get("/health")
def health(): return {"ok": True}

@app.get("/universe")
def universe(): return UNIV.to_dict(orient="records")

@app.post("/analyze")
def analyze(req: ScoreReq):
    client = next(c for c in DEMO["clients"] if c["client_id"]==req.client_id)
    holds = client["holdings"]
    expos = risk.check_limits(holds, CFG, UNIV)

    targs = rebalance.target_weights(client["objective"], UNIV)
    orders = rebalance.diff(holds, targs)
    sigs  = research.generate_signals(list(targs.keys()))
    paper = execution.paper_trade(orders, nav_usd=1_000_000, slippage_bps=CFG["trade"]["slippage_bps"])
    comp  = compliance.review(orders, notes=expos["breaches"])

    overall_score = max(0, 100 - 20*len(expos["breaches"]))  # toy scoring

    return {
        "client_id": client["client_id"],
        "objective": client["objective"],
        "overall_score": overall_score,
        "signals": {k: s.__dict__ for k,s in sigs.items()},
        "risk": expos,
        "targets": targs,
        "orders": orders,
        "paper_trades": paper,
        "compliance": comp
    }
