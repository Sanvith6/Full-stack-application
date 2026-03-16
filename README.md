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

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python backend/app.py
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

## Tech Stack

| Layer    | Technology           |
| -------- | -------------------- |
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend  | Python Flask         |
| API      | RESTful JSON         |
| Fonts    | Google Fonts (Orbitron, Rajdhani) |
