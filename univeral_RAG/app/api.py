# app/api.py
from flask import Blueprint, request, jsonify, current_app
import json
import logging

# Import recommended script's module version
# other dev will implement scripts/recommend.py with a run(inputs: dict) -> dict function
from scripts import recommend as recommend_module

api_bp = Blueprint("api", __name__)

@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@api_bp.route("/predict", methods=["POST"])
def predict():
    """
    Expect JSON body. Example:
    {
      "inputs": { "user_id": 123, "context": {...} },
      "top_k": 10
    }
    """
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid JSON body"}), 400

        # Basic validation: require "inputs"
        if "inputs" not in data:
            return jsonify({"error": "'inputs' field is required"}), 422

        inputs = data["inputs"]
        # call the recommend function (other dev will implement heavy logic)
        result = recommend_module.run(inputs, extra_params=data.get("params", {}))

        # Ensure result is serializable (dict/list/primitive)
        return jsonify({"success": True, "result": result}), 200

    except Exception as e:
        current_app.logger.exception("Error processing /predict")
        # Do NOT leak internal trace to clients in production
        return jsonify({"error": "internal server error"}), 500

