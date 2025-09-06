import os
import logging
from flask import Flask
from dotenv import load_dotenv
from routes import bp

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.register_blueprint(bp)

# Production settings
app.config['DEBUG'] = os.getenv('FLASK_ENV') == 'development'
app.config['TESTING'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

@app.errorhandler(404)
def not_found(error):
    return {"error": "Endpoint not found"}, 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return {"error": "Internal server error"}, 500

if __name__ == "__main__":
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))

    logger.info(f"Starting Flask application on port {port}")

    # Listen on all interfaces (0.0.0.0) for cloud deployment
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
