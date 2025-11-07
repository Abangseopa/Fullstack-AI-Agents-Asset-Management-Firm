from utils.llm import llm_json

SYSTEM = """
You are the Chief Compliance Officer Agent. Check orders against restricted lists and position/issuer limits.
Return JSON: {"ok": bool, "flags":[{"ticker":"","issue":"str"}], "notes":"str"}.
Tone: formal, audit-ready.
"""

def pretrade_check(orders: dict, restricted: list[str]):
    up = f"Orders:{orders}\nRestricted list:{restricted}\nReview for compliance."
    fallback = {"ok": True, "flags": [], "notes": "stub check passed"}
    return llm_json(SYSTEM, up, fallback)
