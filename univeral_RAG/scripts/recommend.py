# scripts/recommend.py
def run(inputs: dict, extra_params: dict = None) -> dict:
    """
    Input: inputs (from client)
    Return: a JSON-serializable dict (recommendations, scores, etc.)
    Replace this with the real recommendation logic.
    """
    extra_params = extra_params or {}
    user_id = inputs.get("user_id", "unknown")
    # Demo: return a fake list
    return {"user_id": user_id, "recommendations": [{"id": 42, "score": 0.95}]}

