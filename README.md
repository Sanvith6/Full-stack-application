# VANGUARD // PROTOCOL

A full-stack web application featuring a **Valorant-inspired**, premium frontend experience with a simple Flask backend API.

## Overview

**Frontend** – A visually stunning, gaming-inspired UI built with pure HTML, CSS, and JavaScript. Features include:

- **Cinematic loading screen** with animated SVG logo and progressive bar
- **Multi-layer canvas particle system** with interactive mouse repulsion + floating energy orbs
- **Tactical HUD overlay** — real-time coordinates, FPS counter, crosshair, time display
- **3D card tilt** on agent cards with perspective transforms
- **Angular clip-path aesthetic** throughout (Valorant's signature sharp-cut design language)
- **Animated radar sweep** canvas with randomized threat blips
- **Glitch typography** effects on hero headings
- **Scroll-triggered reveal animations** with staggered delays
- **Mouse-following spotlight** effect
- **Noise & scanline overlays** for CRT depth
- **Agent detail modal** with dramatic open/close transitions
- **Animated stat counters** and progress bar fills
- **Responsive design** from mobile to ultra-wide

**Backend** – A lightweight Flask REST API providing:

- `/api/health` — Server health check
- `/api/agents` — Game-themed agent roster data
- `/api/messages` — CRUD for a real-time communications feed
- `/api/stats` — Application statistics

## Prerequisites

- **Python 3.9+** (Flask 3.1 requires Python ≥ 3.9)
- **pip** (Python package manager, included with Python)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Sanvith6/Full-stack-application.git
cd Full-stack-application

# 2. (Recommended) Create and activate a virtual environment
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the server
python backend/app.py

# Or run with debug mode (development only)
python backend/app.py --debug
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

## Project Structure

```
Full-stack-application/
├── backend/
│   └── app.py              # Flask server & REST API
├── frontend/
│   ├── static/
│   │   ├── css/            # Stylesheets (main, animations, components)
│   │   └── js/             # Client-side scripts (app, particles, animations)
│   └── templates/
│       └── index.html       # Main HTML template
├── requirements.txt         # Python dependencies
└── README.md
```

## API Endpoints

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | `/`              | Serves the main frontend     |
| GET    | `/api/health`    | Server health check          |
| GET    | `/api/stats`     | Application statistics       |
| GET    | `/api/agents`    | Game-themed agent roster     |
| GET    | `/api/messages`  | Retrieve stored messages     |
| POST   | `/api/messages`  | Send a new message (JSON body: `{"text": "...", "author": "..."}`) |

## Tech Stack

| Layer    | Technology           |
| -------- | -------------------- |
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend  | Python Flask         |
| API      | RESTful JSON         |
| Fonts    | Google Fonts (Orbitron, Rajdhani) |
