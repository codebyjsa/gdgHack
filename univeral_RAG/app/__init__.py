# app/__init__.py
from flask import Flask
import logging
from .api import api_bp

def create_app():
    app = Flask(__name__)
    # Basic config
    app.config.from_mapping(
        JSON_SORT_KEYS=False,
        MAX_CONTENT_LENGTH=2 * 1024 * 1024,  # 2MB limit on request body
    )
    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")
    # logging
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    return app

