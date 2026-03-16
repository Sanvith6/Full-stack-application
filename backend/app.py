"""
Simple Flask backend for the Full-Stack Application.
Serves the frontend and provides a minimal REST API.
"""

import json
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, render_template, request, send_from_directory
from flask_cors import CORS

# Resolve paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "frontend", "templates")
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "static")

app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR,
    static_url_path="/static",
)
CORS(app)

# In-memory data store
messages_store = []

# ---------- Page Routes ----------


@app.route("/")
def index():
    """Serve the main landing page."""
    return render_template("index.html")


# ---------- API Routes ----------


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify(
        {
            "status": "online",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0",
        }
    )


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Return application statistics."""
    return jsonify(
        {
            "total_messages": len(messages_store),
            "server_uptime": "active",
            "active_agents": 4,
            "missions_complete": 128,
        }
    )


@app.route("/api/agents", methods=["GET"])
def get_agents():
    """Return a list of agents (game-themed data)."""
    agents = [
        {
            "id": 1,
            "name": "Phoenix",
            "role": "Duelist",
            "origin": "United Kingdom",
            "abilities": ["Blaze", "Curveball", "Hot Hands", "Run It Back"],
            "difficulty": 1,
        },
        {
            "id": 2,
            "name": "Sage",
            "role": "Sentinel",
            "origin": "China",
            "abilities": [
                "Barrier Orb",
                "Slow Orb",
                "Healing Orb",
                "Resurrection",
            ],
            "difficulty": 1,
        },
        {
            "id": 3,
            "name": "Jett",
            "role": "Duelist",
            "origin": "South Korea",
            "abilities": ["Cloudburst", "Updraft", "Tailwind", "Blade Storm"],
            "difficulty": 2,
        },
        {
            "id": 4,
            "name": "Viper",
            "role": "Controller",
            "origin": "United States",
            "abilities": [
                "Snake Bite",
                "Poison Cloud",
                "Toxic Screen",
                "Viper's Pit",
            ],
            "difficulty": 3,
        },
        {
            "id": 5,
            "name": "Sova",
            "role": "Initiator",
            "origin": "Russia",
            "abilities": [
                "Shock Bolt",
                "Recon Bolt",
                "Owl Drone",
                "Hunter's Fury",
            ],
            "difficulty": 2,
        },
        {
            "id": 6,
            "name": "Omen",
            "role": "Controller",
            "origin": "Unknown",
            "abilities": [
                "Paranoia",
                "Dark Cover",
                "Shrouded Step",
                "From The Shadows",
            ],
            "difficulty": 3,
        },
    ]
    return jsonify(agents)


@app.route("/api/messages", methods=["GET"])
def get_messages():
    """Return stored messages."""
    return jsonify(messages_store)


@app.route("/api/messages", methods=["POST"])
def post_message():
    """Store a new message."""
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Message text is required"}), 400

    text = str(data["text"])[:500]  # Limit message length
    message = {
        "id": len(messages_store) + 1,
        "text": text,
        "author": str(data.get("author", "Anonymous"))[:100],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    messages_store.append(message)
    return jsonify(message), 201


# ---------- Run ----------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run the Vanguard Protocol server")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()
    app.run(debug=args.debug, host="0.0.0.0", port=5000)
