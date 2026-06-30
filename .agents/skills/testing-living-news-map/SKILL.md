---
name: testing-living-news-map
description: Test the Living News Map 3D visualization app end-to-end. Use when verifying frontend UI, 3D rendering, news feed, overlays, or keyboard shortcuts.
---

# Testing Living News Map

## Prerequisites

- Node.js 22+ installed
- Frontend dependencies installed: `cd frontend && npm install --legacy-peer-deps`

## Setup

1. Start the dev server in mock mode (no backend needed):
   ```bash
   cd frontend && VITE_MOCK_NEWS=true npx vite --host
   ```
2. The app runs on `http://localhost:5173` (or next available port if occupied).
3. Mock mode generates 50 news packages across 15 cities and 10 categories on load, then adds ~1 package every 8 seconds via a live simulator.

## Key Test Flows

### 1. Loading Screen
- Navigate to the app URL
- Expect: "// LIVE NEWS MAP" title, progress bar advancing through phases (INITIALIZING SYSTEM, LOADING WORLD GEOMETRY, CALIBRATING POST-PROCESSING, SYSTEM READY at 100%)
- Loading takes ~5-8 seconds

### 2. 3D World Map
- After loading completes, the Three.js canvas should show:
  - Diamond-shaped extruded country geometries
  - Colored news nodes (spheres/icons) positioned on the map
  - Grid overlay (holographic pattern)
  - Post-processing effects (bloom/glow)

### 3. News Feed Panel
- Left panel "ACTIVE FEEDS" shows storylines
- Each item: country flag emoji, city/country, headline, timestamp, source
- Category filter tabs: ALL, GEO, MIL, ECO, TECH, HEALTH, CLIMATE, SOC, SEC, DIP, OTHER
- Clicking a category reduces displayed items to that category only
- Bottom shows storyline count

### 4. Storyline Overlay
- Click any news item in the feed
- Expect: 480px panel slides in from right
- Shows: headline, city/country, category, importance/sentiment stats, chronological event cards with timestamps, article links, entity tags
- Close with Escape key or X button

### 5. LIVE/ARCHIVE Mode Toggle
- Click ARCHIVE button in top bar
- Expect: date picker appears with 6 past dates, event counts, BREAKING badges
- Click LIVE to return to real-time feed
- Note: switching to LIVE resets the mock simulator (package count restarts from 0)

### 6. Keyboard Shortcuts
- Click on the 3D canvas first to ensure keyboard focus
- `Shift+/` (?) opens keyboard shortcuts help modal
- `G` toggles grid overlay (visible change in floor pattern)
- `B` toggles bloom post-processing (visible change in glow intensity)
- `Escape` closes overlays, deselects nodes

### 7. Breaking News Alert
- Mock simulator fires a breaking alert periodically (~every 60s)
- Red banner drops from top with BREAKING label, headline, location, source
- Has VIEW and close (X) buttons
- Auto-dismisses after countdown; queues multiple alerts

### 8. Live Package Count
- Top bar shows "PACKAGES: N" counter
- Count should increment every ~8 seconds in mock mode
- New items appear at top of news feed

## Tips and Gotchas

- The `?` keyboard shortcut requires `Shift+/` (shift+slash), not just pressing the `?` key directly.
- When testing keyboard shortcuts, click on the 3D canvas area first to ensure the app receives keyboard events (not the browser address bar or news feed panel).
- The loading screen takes 5-8 seconds. Wait for "SYSTEM READY" at 100% before testing.
- Breaking alerts may appear at any time and overlay other UI. Close them with the X button before testing other features.
- Switching from ARCHIVE back to LIVE resets mock data - the package count restarts from 0.
- The mock simulator generates randomized data on each page load, so specific headlines/cities will differ between runs.
- If the dev server port 5173 is busy, Vite auto-selects the next available port (5174, etc.).

## Devin Secrets Needed

None required for mock mode testing. Backend testing would require PostgreSQL and Redis connections configured in `backend/.env`.
