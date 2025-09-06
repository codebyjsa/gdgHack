from flask import Blueprint, request, jsonify, render_template_string
from scripts.advanced_rag import recommend
import logging

logger = logging.getLogger(__name__)
bp = Blueprint("routes", __name__)

@bp.route("/recommend", methods=["POST"])
def recommend_courses():
    """Advanced course recommendation endpoint"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        query = data.get("prompt", "").strip()
        if not query:
            return jsonify({"error": "No prompt provided"}), 400

        top_k = data.get("top_k", 5)
        if not isinstance(top_k, int) or top_k < 1 or top_k > 20:
            return jsonify({"error": "top_k must be an integer between 1 and 20"}), 400

        user_preferences = data.get("user_preferences", {})

        logger.info(f"Processing recommendation request: '{query}' (top_k={top_k})")

        results = recommend(query, top_k=top_k, user_preferences=user_preferences)

        if "error" in results:
            return jsonify(results), 404

        return jsonify(results)

    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": "2025-01-06T21:25:00Z",
        "version": "2.0.0"
    })

@bp.route("/courses", methods=["GET"])
def get_courses():
    """Get all available courses"""
    try:
        import json
        import os

        courses_path = os.path.join(os.path.dirname(__file__), "courses.json")
        with open(courses_path, 'r') as f:
            courses = json.load(f)

        return jsonify({
            "courses": courses,
            "total": len(courses),
            "timestamp": "2025-01-06T21:25:00Z"
        })

    except Exception as e:
        logger.error(f"Error loading courses: {str(e)}")
        return jsonify({"error": "Unable to load courses"}), 500

@bp.route("/")
def index():
    html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Recommendation System</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        input, button { padding: 10px; margin: 5px; }
        input { width: 70%; }
        button { background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        .recommendation { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .score { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Course Recommendation System</h1>
        <p>Enter a description of what you want to learn:</p>
        <input type="text" id="prompt" placeholder="e.g., I want to learn machine learning">
        <input type="number" id="topK" placeholder="Number of results" value="3" min="1" max="10">
        <button onclick="getRecommendations()">Get Recommendations</button>

        <div id="results"></div>
    </div>

    <script>
        async function getRecommendations() {
            const prompt = document.getElementById('prompt').value;
            const topK = document.getElementById('topK').value;
            const resultsDiv = document.getElementById('results');

            if (!prompt.trim()) {
                resultsDiv.innerHTML = '<div class="error">Please enter a prompt</div>';
                return;
            }

            resultsDiv.innerHTML = '<p>Loading...</p>';

            try {
                const response = await fetch('/recommend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        top_k: parseInt(topK)
                    })
                });

                const data = await response.json();

                if (data.error) {
                    resultsDiv.innerHTML = `<div class="error">${data.error}</div>`;
                    return;
                }

                let html = '<h2>Recommendations:</h2>';
                data.recommendations.forEach(rec => {
                    html += `
                        <div class="recommendation">
                            <h3>${rec.title}</h3>
                            <p><strong>Author:</strong> ${rec.author}</p>
                            <p><strong>Category:</strong> ${rec.category}</p>
                            <p><strong>Description:</strong> ${rec.description}</p>
                            <p><strong>Match Score:</strong> <span class="score">${rec.score}%</span></p>
                            <p><a href="${rec.link}" target="_blank">View Course</a></p>
                        </div>
                    `;
                });

                resultsDiv.innerHTML = html;
            } catch (error) {
                resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            }
        }

        // Allow Enter key to submit
        document.getElementById('prompt').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getRecommendations();
            }
        });
    </script>
</body>
</html>
    """
    return render_template_string(html)
