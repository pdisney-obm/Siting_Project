# ATL Site Reviewer

A password-protected web app for reviewing proposed billboard/signage sites in Atlanta. Reviewers see each site on an interactive map, click into a street-level view with full metadata, and record a decision (Yes / No / Inventory). Built to run locally during prototyping, with a clean path to Railway deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Map | Mapbox GL JS |
| Street View | Google Maps JavaScript API (Panorama) |
| Backend | Node.js + Express |
| Decision storage | `decisions.json` (flat file, server-side) |
| Auth | Password middleware (env var, single shared password) |

---

## Project Structure

```
atl-site-reviewer/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── data/
│       │   └── sites.json          ← Static site data (geocoded coords included after setup step)
│       └── components/
│           ├── PasswordGate.jsx    ← Shown before any content; validates password against server
│           ├── Map.jsx             ← Mapbox GL JS map centered on Atlanta with color-coded markers
│           ├── ReviewPanel.jsx     ← Side panel: StreetView + MetadataCard + DecisionButtons
│           ├── StreetView.jsx      ← Google Maps Street View Panorama iframe/embed
│           ├── MetadataCard.jsx    ← Renders all site fields in a clean card layout
│           └── DecisionButtons.jsx ← Yes / No / Inventory buttons; posts to backend on click
├── server/
│   ├── index.js                   ← Express server: serves React build + API routes
│   └── decisions.json             ← Auto-created on first decision; persists across restarts
├── scripts/
│   └── geocode.js                 ← One-time script: geocodes all 21 sites, writes coords to sites.json
├── .env                           ← Not committed; see .env.example
├── .env.example
└── .gitignore
```

---

## Environment Variables

Create a `.env` file in the project root (never commit this file):

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
GOOGLE_MAPS_KEY=your_google_maps_api_key_here   # Used server-side by geocode.js
SITE_PASSWORD=your_chosen_password_here
PORT=3001
```

`.env.example` should mirror the above with empty values as a template.

---

## Setup Steps

### 1. Install dependencies

```bash
# In project root
npm install

# In client/
cd client && npm install
```

### 2. Geocode the sites (one-time step)

Run the geocoding script to convert intersection names to lat/lng coordinates. This hits the Google Geocoding API once and writes the results into `client/src/data/sites.json`. After this runs successfully, you do not need to run it again.

```bash
node scripts/geocode.js
```

The script appends `, Atlanta, GA` to each intersection string and calls the Google Geocoding API. If any site fails to geocode (check the console output), the address string can be adjusted in `sites.json` and the script re-run for that entry only.

### 3. Run locally

Open two terminals:

```bash
# Terminal 1 – backend
node server/index.js

# Terminal 2 – frontend
cd client && npm run dev
```

The frontend dev server proxies API requests to the backend. Configure this in `vite.config.js`:

```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}
```

---

## Data Schema

All site data lives in `client/src/data/sites.json`. Each entry follows this structure:

```json
{
  "siteId": "ATL-269",
  "rank": 6,
  "siteType": "Inventory",
  "intersection": "Ellsworth Industrial Blvd NW",
  "approvedAlternateCorner": null,
  "primaryAADT": 9230,
  "aadtRating": 2,
  "alcoholCompliance": "Green",
  "acRating": 3,
  "downstreamUpstream": "N/A",
  "positionRatingDU": 1,
  "lhRhRead": "RH",
  "ratingLHRH": 2,
  "cornerMidBlock": "Mid-block",
  "positionRatingCorner": 1,
  "traffic": "2-way",
  "trafficRating": 2,
  "obstructions": "None",
  "obstructionRating": 3,
  "pedestrianRating": 2,
  "comments": "Like pedestrian aspect/West Side Market",
  "lat": null,
  "lng": null
}
```

`lat` and `lng` are populated by the geocode script. The `score` field is NOT stored — it is computed at runtime (see Score Calculation below).

### All 21 Sites (pre-geocode state)

```json
[
  { "siteId": "ATL-269", "rank": 6,  "siteType": "Inventory",       "intersection": "Ellsworth Industrial Blvd NW",                                        "approvedAlternateCorner": null,                                  "primaryAADT": 9230,  "aadtRating": 2, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "N/A",      "positionRatingDU": 1, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Mid-block", "positionRatingCorner": 1, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": "Like pedestrian aspect/West Side Market",                                                                                                                           "lat": null, "lng": null },
  { "siteId": "ATL-273", "rank": 10, "siteType": "Inventory - SE",   "intersection": "W Paces Ferry Rd NW & Horace E Tate Fwy",                              "approvedAlternateCorner": null,                                  "primaryAADT": 13538, "aadtRating": 2, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "LH", "ratingLHRH": 1, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 1, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-275", "rank": 12, "siteType": "NO",               "intersection": "Irby Ave NW & Cains Hill Pl NW",                                       "approvedAlternateCorner": null,                                  "primaryAADT": 1662,  "aadtRating": 1, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "LH", "ratingLHRH": 1, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": "Low AADT, weird look by the loading area of Whole Foods and kind of maintenance looking street",                                                              "lat": null, "lng": null },
  { "siteId": "ATL-280", "rank": 17, "siteType": "Inventory - SE",   "intersection": "Boulevard SE & Custer Ave SE",                                         "approvedAlternateCorner": "Catty corner, Boulevard SE read",     "primaryAADT": 18749, "aadtRating": 3, "alcoholCompliance": "Red",    "acRating": 1, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "Partial", "obstructionRating": 2, "pedestrianRating": 1, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-267", "rank": 4,  "siteType": "Inventory",        "intersection": "Highland Ave NE & Randolph St NE",                                     "approvedAlternateCorner": null,                                  "primaryAADT": 8340,  "aadtRating": 1, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-268", "rank": 5,  "siteType": "NO",               "intersection": "Peachtree St NE & Ivan Allen Jr Blvd NE",                              "approvedAlternateCorner": null,                                  "primaryAADT": 1662,  "aadtRating": 2, "alcoholCompliance": "Red",    "acRating": 1, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": "Jibran does not want to prioritize more Downtown sites - have enough for 2026 goal of 143 market total",                                                                                 "lat": null, "lng": null },
  { "siteId": "ATL-272", "rank": 9,  "siteType": "Inventory",        "intersection": "Pharr Rd NE & Maple Dr NE",                                            "approvedAlternateCorner": null,                                  "primaryAADT": 13200, "aadtRating": 2, "alcoholCompliance": "Yellow", "acRating": 2, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "LH", "ratingLHRH": 1, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-274", "rank": 11, "siteType": "NO",               "intersection": "Peachtree St NE & Pine St NE",                                         "approvedAlternateCorner": "Downstream corner, Peachtree read",   "primaryAADT": 13538, "aadtRating": 2, "alcoholCompliance": "Red",    "acRating": 1, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": "Jibran does not want to prioritize more Downtown sites - have enough for 2026 goal of 143 market total",                                                                                 "lat": null, "lng": null },
  { "siteId": "ATL-284", "rank": 21, "siteType": "Inventory",        "intersection": "Boulevard NE & E Ave NE",                                              "approvedAlternateCorner": "Across Ave, Boulevard read",          "primaryAADT": 19600, "aadtRating": 3, "alcoholCompliance": "Red",    "acRating": 1, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 1, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-265", "rank": 2,  "siteType": "Preferred - SE",   "intersection": "Fulton St SW & Windsor St SW",                                         "approvedAlternateCorner": "Across Windsor, Fulton read",         "primaryAADT": 13538, "aadtRating": 3, "alcoholCompliance": "Yellow", "acRating": 2, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 1, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-270", "rank": 7,  "siteType": "Inventory",        "intersection": "Fowler St NW & Ferst Dr NW",                                           "approvedAlternateCorner": "Any corner",                          "primaryAADT": 1662,  "aadtRating": 1, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "Partial", "obstructionRating": 2, "pedestrianRating": 3, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-281", "rank": 18, "siteType": "Inventory",        "intersection": "Howell Mill Rd NW & Bellemeade Ave NW",                                "approvedAlternateCorner": null,                                  "primaryAADT": 18749, "aadtRating": 3, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "LH", "ratingLHRH": 1, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 1, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-244", "rank": 1,  "siteType": "NO",               "intersection": "MLK Jr Dr SW & Pryor St SW",                                           "approvedAlternateCorner": null,                                  "primaryAADT": 18749, "aadtRating": 3, "alcoholCompliance": "Yellow", "acRating": 2, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "1-way", "trafficRating": 1, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": "Jibran does not want to prioritize more Downtown sites - have enough for 2026 goal of 143 market total",                                                                                 "lat": null, "lng": null },
  { "siteId": "ATL-283", "rank": 20, "siteType": "Inventory",        "intersection": "Boulevard NE & Ralph McGill Blvd NE",                                  "approvedAlternateCorner": "Across Boulevard, Boulevard read",    "primaryAADT": 19600, "aadtRating": 3, "alcoholCompliance": "Red",    "acRating": 1, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-266", "rank": 3,  "siteType": "NO",               "intersection": "Piedmont Ave NE & Pine St NE",                                         "approvedAlternateCorner": null,                                  "primaryAADT": 18749, "aadtRating": 4, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "1-way", "trafficRating": 1, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 1, "comments": "Jibran does not want to prioritize more Downtown sites - have enough for 2026 goal of 143 market total",                                                                                 "lat": null, "lng": null },
  { "siteId": "ATL-276", "rank": 13, "siteType": "NO",               "intersection": "Hank Aaron Dr SW & Georgia Ave SE",                                    "approvedAlternateCorner": "RH Hank Aaron Dr read",              "primaryAADT": 10800, "aadtRating": 2, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "LH", "ratingLHRH": 1, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 3, "comments": "Jibran does not want to prioritize more Mechanicsburg sites - have enough for 2026 goal of 143 market total",                                                                              "lat": null, "lng": null },
  { "siteId": "ATL-277", "rank": 14, "siteType": "NO",               "intersection": "Ted Turner Dr NW & John Portman Blvd NW",                              "approvedAlternateCorner": null,                                  "primaryAADT": 18749, "aadtRating": 3, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "1-way", "trafficRating": 1, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 2, "comments": "Jibran does not want to prioritize more Downtown sites - have enough for 2026 goal of 143 market total",                                                                                 "lat": null, "lng": null },
  { "siteId": "ATL-279", "rank": 16, "siteType": "Preferred",        "intersection": "17th St NW & State St NW",                                             "approvedAlternateCorner": "Catty corner, 17th St read",          "primaryAADT": 18749, "aadtRating": 3, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "Partial", "obstructionRating": 2, "pedestrianRating": 2, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-282", "rank": 19, "siteType": "Preferred - SE",   "intersection": "Capitol Ave SW & Fulton St SW",                                        "approvedAlternateCorner": "Catty corner, Capitol Ave read",      "primaryAADT": 10800, "aadtRating": 2, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 3, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-278", "rank": 15, "siteType": "Inventory",        "intersection": "Howell Mill Rd NW & Huff Rd NW",                                       "approvedAlternateCorner": "Across Howell, Howell read (LH)",     "primaryAADT": 18749, "aadtRating": 3, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "Partial", "obstructionRating": 2, "pedestrianRating": 3, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null },
  { "siteId": "ATL-271", "rank": 8,  "siteType": "Preferred",        "intersection": "W Paces Ferry Rd NW & Slaton Dr NW",                                   "approvedAlternateCorner": null,                                  "primaryAADT": 18749, "aadtRating": 3, "alcoholCompliance": "Green",  "acRating": 3, "downstreamUpstream": "Upstream",  "positionRatingDU": 2, "lhRhRead": "RH", "ratingLHRH": 2, "cornerMidBlock": "Corner",    "positionRatingCorner": 2, "traffic": "2-way", "trafficRating": 2, "obstructions": "None",    "obstructionRating": 3, "pedestrianRating": 3, "comments": null,                                                                                                                                                                                         "lat": null, "lng": null }
]
```

---

## Score Calculation

The score is derived from the Excel formula `=(T*2)+S+Q+O+M+(K*2)+I+(G*2)`, where the letters map to column values. Implement this as a pure function:

```js
function computeScore(site) {
  return (
    site.pedestrianRating * 2 +   // T × 2
    site.obstructionRating +        // S
    site.trafficRating +            // Q
    site.positionRatingCorner +     // O
    site.ratingLHRH +               // M
    site.positionRatingDU * 2 +    // K × 2
    site.acRating +                 // I
    site.aadtRating * 2             // G × 2
  );
}
```

Display this computed value as "Score" in the MetadataCard. Do not store it.

---

## API Routes (server/index.js)

### Authentication

**POST `/api/auth`**
- Body: `{ "password": "..." }`
- Returns: `{ "token": "<uuid>" }` on success, 401 on failure
- The server stores valid tokens in memory (array). On restart, users re-authenticate. This is fine for local use.

**All other `/api/*` routes** require an `Authorization: Bearer <token>` header. Return 401 if missing or invalid.

### Decisions

**GET `/api/decisions`**
- Returns: `{ "ATL-269": "yes", "ATL-273": "no", ... }`
- Reads from `server/decisions.json` (return `{}` if file doesn't exist yet)

**POST `/api/decisions/:siteId`**
- Body: `{ "decision": "yes" | "no" | "inventory" }`
- Writes/updates the entry in `server/decisions.json`
- Returns: `{ "ok": true }`

### Sites

Sites are served as a static import in the frontend (`client/src/data/sites.json`). There is no `/api/sites` route needed.

---

## Frontend Behavior

### App.jsx

- On load, check `localStorage` for a stored auth token
- If no token, render `<PasswordGate />`
- Once authenticated, render the map + panel layout
- State: `selectedSite` (the site the user has clicked), `decisions` (fetched from API on mount)

### Map.jsx (Mapbox GL JS)

- Center: `[-84.388, 33.749]` (Atlanta), zoom: `11`
- Render one marker per site using the site's `lat` / `lng`
- Marker color based on decision status:
  - **Gray** `#9CA3AF` — no decision yet
  - **Green** `#22C55E` — "yes"
  - **Red** `#EF4444` — "no"
  - **Yellow** `#EAB308` — "inventory"
- Clicking a marker sets `selectedSite` in App state
- Include a "Next unreviewed" button (fixed position, top-right of map) that selects the first site in the list with no decision. Fly the map to that site's coordinates on selection.

### ReviewPanel.jsx

Renders as a right-side drawer/panel when `selectedSite` is set. Contains three sections stacked vertically:

1. **StreetView.jsx** — top ~55% of panel height
2. **MetadataCard.jsx** — scrollable metadata below the street view
3. **DecisionButtons.jsx** — fixed at the bottom of the panel

Close button (×) in the top-right corner clears `selectedSite`.

### StreetView.jsx

Use the Google Maps JavaScript API to render a `google.maps.StreetViewPanorama` into a div. Initialize it with:

```js
new google.maps.StreetViewPanorama(containerRef.current, {
  position: { lat: site.lat, lng: site.lng },
  pov: { heading: 0, pitch: 0 },
  zoom: 1,
  addressControl: false,
  fullscreenControl: false,
  motionTracking: false,
  motionTrackingControl: false,
})
```

Load the Google Maps script via `@googlemaps/js-api-loader` (install as a dependency):

```bash
npm install @googlemaps/js-api-loader
```

### MetadataCard.jsx

Display all fields in a clean two-column grid of label/value pairs. Field display order:

1. Site ID
2. Site Type
3. Intersection
4. Approved Alternate Corner
5. Score *(computed via `computeScore(site)`)*
6. Primary AADT
7. AADT Rating
8. Alcohol Compliance *(color-code the value: Green → green badge, Yellow → yellow badge, Red → red badge)*
9. AC Rating
10. Downstream / Upstream
11. Position Rating (D/U)
12. LH / RH Read
13. LH/RH Rating
14. Corner / Mid-Block
15. Position Rating (Corner)
16. Traffic
17. Traffic Rating
18. Obstructions
19. Obstruction Rating
20. Pedestrian Rating
21. Comments *(full width, shown only if non-null)*

### DecisionButtons.jsx

Three buttons displayed side by side:

| Button | Value posted | Color |
|---|---|---|
| ✓ Yes | `"yes"` | Green |
| ✗ No | `"no"` | Red |
| ⊙ Inventory | `"inventory"` | Yellow |

On click: POST to `/api/decisions/:siteId`, then update the local `decisions` state so the map marker re-colors immediately without a page refresh. Highlight the active decision with a filled/selected style.

### PasswordGate.jsx

Simple centered form with a password input and submit button. On submit, POST to `/api/auth`. On success, store the returned token in `localStorage` and re-render the app. Show an error message on 401.

---

## Geocoding Script (scripts/geocode.js)

```js
// scripts/geocode.js
// Run once: node scripts/geocode.js
// Requires GOOGLE_MAPS_KEY in .env

import 'dotenv/config';
import fs from 'fs';
import https from 'https';

const SITES_PATH = './client/src/data/sites.json';
const API_KEY = process.env.GOOGLE_MAPS_KEY;
const sites = JSON.parse(fs.readFileSync(SITES_PATH, 'utf-8'));

function geocode(address) {
  const query = encodeURIComponent(`${address}, Atlanta, GA`);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${API_KEY}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.status === 'OK') {
          resolve(json.results[0].geometry.location);
        } else {
          resolve(null); // Don't crash on failure
          console.warn(`  ⚠ Failed: ${address} — ${json.status}`);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const site of sites) {
    if (site.lat && site.lng) {
      console.log(`  ✓ ${site.siteId} already has coordinates, skipping`);
      continue;
    }
    process.stdout.write(`  Geocoding ${site.siteId}: ${site.intersection}... `);
    const loc = await geocode(site.intersection);
    if (loc) {
      site.lat = loc.lat;
      site.lng = loc.lng;
      console.log(`${loc.lat}, ${loc.lng}`);
    } else {
      console.log('failed');
    }
    await new Promise(r => setTimeout(r, 150)); // Rate limit
  }
  fs.writeFileSync(SITES_PATH, JSON.stringify(sites, null, 2));
  console.log('\nDone. sites.json updated.');
}

run();
```

---

## .gitignore

```
node_modules/
client/node_modules/
dist/
client/dist/
.env
server/decisions.json
```

---

## Railway Deployment (Future)

When ready to deploy:

1. Add a `build` script to the root `package.json` that builds the React app and copies the output to the Express static folder
2. Set all environment variables in the Railway dashboard (not in `.env`)
3. The `server/decisions.json` file will reset on each Railway deploy — at that point, migrate to a Railway-provisioned Postgres or SQLite database. The API contract stays the same; only the read/write implementation in `server/index.js` changes.

---

## Future: Sitetracker Integration

When this feature is added, the decision POST endpoint (`POST /api/decisions/:siteId`) should be extended to also call the Sitetracker API with the decision payload after writing locally. No frontend changes will be required — the integration is entirely server-side.

---

## Notes for the Developer

- The Google Maps API key needs **Maps JavaScript API** and **Geocoding API** enabled in Google Cloud Console
- The Mapbox token needs **Mapbox GL JS** scopes (default public tokens work)
- All 21 sites are in the `siteType` categories: `Inventory`, `Inventory - SE`, `Preferred`, `Preferred - SE`, and `NO`. These are reference data from the original spreadsheet, distinct from the reviewer's `Yes / No / Inventory` decision
- The `rank` field (column A in the source spreadsheet) is display-only; do not use it for navigation ordering. Sort unreviewed sites by `siteId` for the "Next" button
