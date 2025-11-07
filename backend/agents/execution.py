from utils.llm import llm_json

SYSTEM = """
You are the Execution Desk Agent. Translate current vs target weights into child orders, with venue notes and urgency.
Assume ADV awareness; minimize slippage. Return JSON:
{"orders":[{"ticker":"","side":"BUY|SELL","qty":int,"urgency":"low|med|high"}]}.
Tone: precise, professional.
"""

def route_orders(current: dict[str,float], targets: dict, prices: dict[str,float]):
    up = f"Current weights:{current}\nTargets:{targets}\nPrices:{prices}\nCreate orders."
    fallback = {"orders":[]}
    return llm_json(SYSTEM, up, fallback)

def paper_trade(orders: dict[str,float], nav_usd: float, price=100.0, slippage_bps=5):
    # Optional deterministic simulator if you want fills
    fills = {}
    for t, w in orders.items():
        notional = nav_usd * w
        eff_price = price*(1 + (slippage_bps/10000.0) * (1 if w>0 else -1))
        shares = round(notional/eff_price, 3)
        fills[t] = {"shares": shares, "avg_price": round(eff_price,2), "notional": round(notional,2)}
    return fills
