import json
from agents import research, risk, rebalance, execution, compliance

def run_cycle(tickers, current_positions: dict[str,float], prices: dict[str,float], restricted:list[str]):
    sig = research.generate_signals(tickers)
    # risk assessor can use a simple list of positions (ticker/weight)
    pos_list = [{"ticker": t, "weight": w} for t, w in current_positions.items()]
    rk  = risk.assess(pos_list)

    tgt = rebalance.propose_targets(tickers, sig, rk.get("limits", {}))
    # normalize targets into simple {ticker: weight}
    tgt_map = {i["ticker"]: i["weight"] for i in tgt.get("targets", [])}

    ords = execution.route_orders(current_positions, tgt, prices)
    comp = compliance.pretrade_check(ords, restricted)

    return {
        "signals": sig,
        "risk": rk,
        "targets": tgt,
        "orders": ords,
        "compliance": comp
    }
