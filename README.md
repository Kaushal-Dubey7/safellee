<p align="center">
  <img src="https://img.shields.io/badge/Safelle-The%20Silent%20Guardian-FF6B00?style=for-the-badge&logoColor=white" alt="Safelle Banner" />
</p>

<h1 align="center">🛡️ Safelle — The Silent Guardian</h1>

<p align="center">
  <strong>A real-time women's safety web application that provides intelligent route planning, live journey tracking, and instant SOS emergency alerts.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socket.io" />
  <img src="https://img.shields.io/badge/Twilio-SMS%20%26%20Calls-F22F46?style=flat-square&logo=twilio" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## 📖 Table of Contents

- [Project Definition](#-project-definition)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Safety Score Algorithm](#-safety-score-algorithm)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Real-Time Communication](#-real-time-communication)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Feasibility Analysis](#-feasibility-analysis)
- [Future Roadmap](#-future-roadmap)
- [Contributors](#-contributors)

---

## 🎯 Project Definition

**Safelle** (Safe + Elle — *"elle"* meaning *"she"* in French) is a full-stack women's safety web application designed to empower women with intelligent, data-driven navigation and real-time emergency response. The platform combines geospatial crime data, OpenStreetMap infrastructure analysis, live weather feeds, and community-sourced safety ratings into a unified **Safety Score** for every route.

Unlike traditional navigation apps that optimize for speed or distance, Safelle optimizes for **personal safety** — analyzing street lighting density, crowd patterns, crime zone proximity, and weather conditions to recommend the safest path from A to B. During active journeys, a **Dead Man's Switch** mechanism continuously monitors the traveler and automatically triggers SOS protocols if she becomes unresponsive.

### Core Objectives

| Objective | Description |
|-----------|-------------|
| **Safe Navigation** | Provide AI-scored multi-route alternatives ranked by composite safety metrics |
| **Real-Time Protection** | GPS-powered live tracking with automatic check-in prompts and deviation alerts |
| **Instant Emergency Response** | One-tap SOS that sends SMS, automated voice calls, and police station alerts via Twilio |
| **Community Intelligence** | Crowdsourced route ratings and safety reviews to build a living safety database |
| **Loved Ones Network** | Emergency contact management with automatic notification during SOS events |

---

## 🚨 Problem Statement

Women across India face significant safety risks during daily commutes, especially during nighttime travel. Existing navigation apps (Google Maps, etc.) do not factor in **safety-specific parameters** like:

- Crime hotspot proximity
- Street lighting adequacy
- Crowd density at the time of travel
- Weather-related visibility risks

**Safelle bridges this gap** by providing a safety-first navigation experience with automated emergency response capabilities.

---

## ✨ Key Features

### 🗺️ Smart Route Planner
- Fetches up to **3 alternative routes** from OSRM (Open Source Routing Machine)
- Each route is scored across **6 safety dimensions** (crime, lighting, crowd, weather, efficiency, community)
- Routes are color-coded: 🟢 Safe | 🟡 Medium | 🔴 Risky
- Interactive **Leaflet.js** map with polyline overlays and POI markers

### 📍 Real-Time Journey Tracking
- Live GPS tracking via the browser Geolocation API
- Location updates broadcast to all connected clients via **Socket.IO**
- Full location history stored in MongoDB for post-journey review
- **Route deviation detection** — alerts when the user strays more than 50m from the planned path

### 🚨 One-Tap SOS System
- **Manual SOS** — User triggers emergency with a single tap
- **Automatic SOS** — Dead Man's Switch triggers after 10 minutes of no response
- **Twilio SMS** — Emergency SMS with Google Maps location link sent to all contacts
- **Twilio Voice Calls** — Automated voice calls using Polly.Aditi (Indian English TTS) read out the user's name and street address
- **Police Station Alert** — Nearest police station identified via Overpass API and alerted if phone number is available
- **Reverse Geocoding** — Location converted to human-readable address via Nominatim for voice alerts

### ⚡ Dead Man's Switch
- **5-minute warning** — Check-in prompt with countdown timer and device vibration
- **10-minute auto-SOS** — If the user doesn't respond, full SOS protocol activates automatically
- Timer resets on any location update or manual "I'm Safe" confirmation
- Works both client-side (React hook) and server-side (Socket.IO timers)

### 🏥 Points of Interest (POI)
- Fetches nearby **hospitals**, **police stations**, and **pharmacies** from OpenStreetMap Overpass API
- POI markers displayed on the journey map with name, address, and distance
- Results cached in-memory for 5 minutes to reduce API load

### ⭐ Community Ratings
- Users can rate completed routes on a 1–5 scale
- Tag-based feedback: "Well Lit", "Crowded", "Safe Area", or "Dark", "Isolated", "Unsafe"
- Ratings feed with location context and relative timestamps
- Community scores are factored into the master Safety Score algorithm

### 👨‍👩‍👧 Loved Ones Management
- Add up to multiple emergency contacts with name, phone, and relationship
- Contacts receive automated SMS and voice calls during SOS events
- Manage contacts from a dedicated dashboard page

### 👤 User Profile
- Secure registration with email, phone, and password
- Profile setup flow with photo upload, address, and emergency contact onboarding
- JWT-based authentication with protected routes
- Profile completion gate — users must complete setup before accessing features

---

## 🛠️ Tech Stack

### Frontend (Client)

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with functional components and hooks |
| **Vite 8** | Lightning-fast dev server and build tool |
| **React Router v7** | Client-side routing with protected/public route guards |
| **Leaflet.js + React-Leaflet** | Interactive map rendering with polylines, markers, and popups |
| **Socket.IO Client** | Real-time WebSocket communication for live tracking |
| **Axios** | HTTP client for REST API calls |
| **Capacitor** | Native mobile wrapper for potential APK deployment |

### Backend (Server)

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | RESTful API server |
| **MongoDB + Mongoose** | NoSQL database with geospatial indexing (`2dsphere`) |
| **Socket.IO** | Real-time bidirectional event-based communication |
| **Twilio** | SMS delivery and automated voice calls for SOS |
| **JWT (jsonwebtoken)** | Stateless authentication tokens |
| **bcryptjs** | Password hashing |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | API rate limiting (disabled for hackathon) |

### External APIs

| API | Purpose |
|-----|---------|
| **OSRM** | Multi-route driving directions with GeoJSON geometries |
| **OpenStreetMap Overpass** | Street lamp density, amenity counts, police/hospital/pharmacy POIs |
| **OpenWeatherMap** | Real-time weather data for route scoring |
| **Nominatim** | Reverse geocoding (coordinates → street address) |
| **Twilio Voice + SMS** | Emergency notifications with TTS voice alerts |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                 │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ AuthCtx  │  │JourneyCtx│  │  SOSCtx  │  │   Hooks      │ │
│  │          │  │          │  │          │  │ useGeolocatn │ │
│  │ Login    │  │ Tracking │  │ Trigger  │  │ useDeadMan   │ │
│  │ Register │  │ Location │  │ Contacts │  │ useDeviation │ │
│  │ JWT      │  │ Socket   │  │ History  │  │ useSocket    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │             │             │                │         │
│  ┌────┴─────────────┴─────────────┴────────────────┴───────┐ │
│  │                    Axios / Socket.IO                     │ │
│  └─────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP + WebSocket
┌────────────────────────────┼─────────────────────────────────┐
│                     SERVER (Node.js + Express)               │
│                            │                                 │
│  ┌─────────────────────────┴───────────────────────────────┐ │
│  │                      API Routes                         │ │
│  │  /auth  /user  /route  /journey  /sos  /ratings  /poi   │ │
│  └────┬────────┬────────┬────────┬────────┬────────┬───────┘ │
│       │        │        │        │        │        │         │
│  ┌────┴────┐ ┌─┴──────┐ │  ┌─────┴──────┐ │  ┌────┴───────┐ │
│  │  Auth   │ │ User   │ │  │  Journey   │ │  │   POI      │ │
│  │Middelwr │ │ CRUD   │ │  │  Socket    │ │  │  Service   │ │
│  └─────────┘ └────────┘ │  │  Dead Man  │ │  └────────────┘ │
│                         │  └────────────┘ │                  │
│  ┌──────────────────────┴──┐  ┌───────────┴────────────────┐ │
│  │   Safety Score Engine   │  │     Twilio Service          │ │
│  │  Crime · Lighting ·     │  │  SMS · Voice · Police Alert │ │
│  │  Crowd · Weather ·      │  └────────────────────────────┘ │
│  │  Efficiency · Community │                                 │
│  └──────────┬──────────────┘                                 │
└─────────────┼────────────────────────────────────────────────┘
              │
┌─────────────┼────────────────────────────────────────────────┐
│             ▼          EXTERNAL SERVICES                     │
│  ┌──────────────┐  ┌───────────┐  ┌────────────┐  ┌───────┐ │
│  │   MongoDB    │  │   OSRM    │  │  Overpass   │  │Twilio │ │
│  │   Atlas      │  │  Router   │  │  (OSM API)  │  │  API  │ │
│  └──────────────┘  └───────────┘  └────────────┘  └───────┘ │
│  ┌──────────────┐  ┌───────────┐                             │
│  │ OpenWeather  │  │ Nominatim │                             │
│  │    API       │  │ Geocoding │                             │
│  └──────────────┘  └───────────┘                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Safellee/
├── .env                          # Root environment variables
├── .gitignore
├── README.md
│
├── client/                       # React Frontend (Vite)
│   ├── index.html                # App entry point with SEO meta tags
│   ├── package.json
│   ├── vite.config.js
│   ├── capacitor.config.json     # Mobile app config
│   ├── public/                   # Static assets (favicon, manifest)
│   └── src/
│       ├── main.jsx              # React DOM mount
│       ├── App.jsx               # Router + Context providers
│       ├── App.css               # Component-specific styles
│       ├── index.css             # Global design system (13K+ lines)
│       │
│       ├── pages/                # Route-level page components
│       │   ├── Landing.jsx       # Public landing page with hero + features
│       │   ├── Login.jsx         # Email/password login
│       │   ├── Register.jsx      # New user registration
│       │   ├── ProfileSetup.jsx  # First-time profile completion flow
│       │   ├── Dashboard.jsx     # Main dashboard with safety overview
│       │   ├── RoutePlanner.jsx  # Source → Destination route planning
│       │   ├── ActiveJourney.jsx # Live journey tracking with map
│       │   ├── SOSPage.jsx       # Emergency SOS trigger page
│       │   ├── LovedOnes.jsx     # Manage emergency contacts
│       │   ├── CommunityRatings.jsx  # Route ratings feed
│       │   └── Profile.jsx       # User profile management
│       │
│       ├── components/           # Reusable UI components
│       │   ├── Navbar.jsx        # Top navigation bar
│       │   ├── MapView.jsx       # Leaflet map wrapper
│       │   ├── RoutePanel.jsx    # Route comparison panel
│       │   ├── RouteRating.jsx   # Rate a completed route
│       │   ├── SafetyScoreCard.jsx   # Score breakdown display
│       │   ├── SOSButton.jsx     # Floating SOS trigger button
│       │   ├── AlertBanner.jsx   # Deviation / check-in alerts
│       │   ├── JourneyControls.jsx   # Pause/resume/end journey
│       │   ├── LiveTracker.jsx   # Live position indicator
│       │   └── POIMarkers.jsx    # Hospital/police/pharmacy markers
│       │
│       ├── context/              # React Context providers
│       │   ├── AuthContext.jsx   # Authentication state + JWT handling
│       │   ├── JourneyContext.jsx    # Active journey state management
│       │   └── SOSContext.jsx    # SOS state and trigger logic
│       │
│       ├── hooks/                # Custom React hooks
│       │   ├── useGeolocation.js # GPS position watcher with error handling
│       │   ├── useDeadManSwitch.js   # Client-side dead man timer
│       │   ├── useDeviation.js   # Route deviation detector
│       │   └── useSocket.js      # Socket.IO connection manager
│       │
│       ├── services/             # API service layer
│       │   ├── api.js            # Axios instance with JWT interceptor
│       │   ├── routeService.js   # Route planning API calls
│       │   ├── sosService.js     # SOS trigger + history APIs
│       │   ├── poiService.js     # POI fetching service
│       │   └── weatherService.js # Weather data service
│       │
│       └── utils/                # Utility functions
│           ├── geoUtils.js       # Haversine distance, point-on-route check
│           ├── safetyScore.js    # Client-side score formatting
│           └── vibrate.js        # Device vibration patterns
│
└── server/                       # Node.js Backend (Express)
    ├── app.js                    # Server entry — Express + Socket.IO setup
    ├── package.json
    │
    ├── config/
    │   └── db.js                 # MongoDB Atlas connection
    │
    ├── middleware/
    │   ├── auth.js               # JWT verification middleware
    │   └── validate.js           # Request body validation
    │
    ├── models/                   # Mongoose schemas
    │   ├── User.js               # User account (email, phone, profile)
    │   ├── LovedOne.js           # Emergency contacts
    │   ├── Journey.js            # Active/completed journey records
    │   ├── SOSLog.js             # SOS event audit log
    │   ├── CrimeZone.js          # GeoJSON crime zone polygons (2dsphere)
    │   ├── RouteRating.js        # Community route ratings
    │   └── RouteScoreCache.js    # Aggregated area safety scores
    │
    ├── routes/                   # Express API routes
    │   ├── auth.js               # POST /register, /login
    │   ├── user.js               # GET/PUT user profile
    │   ├── route.js              # POST /safe-routes (OSRM + scoring)
    │   ├── journey.js            # CRUD journey lifecycle
    │   ├── sos.js                # POST /trigger, GET /history
    │   ├── ratings.js            # CRUD community ratings
    │   ├── lovedones.js          # CRUD emergency contacts
    │   └── poi.js                # GET nearby POIs
    │
    ├── services/                 # Business logic services
    │   ├── safetyScoreService.js # Master 6-factor scoring engine
    │   ├── twilioService.js      # SMS + Voice call + police alert
    │   ├── poiService.js         # Overpass API POI fetcher with cache
    │   └── weatherService.js     # OpenWeatherMap integration
    │
    ├── socket/
    │   └── journeySocket.js      # Socket.IO event handlers + dead man switch
    │
    └── seed/
        └── seed.js               # Crime zone seeder (Aligarh, Prayagraj)
```

---

## 📊 Safety Score Algorithm

Each route receives a **composite safety score (0–100)** computed from 6 weighted dimensions:

| Factor | Weight | Data Source | How It Works |
|--------|--------|-------------|--------------|
| **Crime** | 30% | MongoDB CrimeZone (seeded) | GeoJSON `$geoIntersects` query — routes passing through high-crime polygons receive lower scores |
| **Lighting** | 25% | OpenStreetMap Overpass API | Counts `highway=street_lamp` nodes within 200m of 3 sample points; applies night-time penalty (×0.55) between 8PM–6AM |
| **Crowd** | 20% | OpenStreetMap Overpass API | Counts amenities (shops, restaurants, offices, hospitals) within 500m; applies time-of-day multiplier (rush hour = safer, late night = dangerous) |
| **Weather** | 10% | OpenWeatherMap API | Maps weather condition → score: Clear=100, Clouds=75, Rain=40, Thunderstorm=10, Fog=35 |
| **Efficiency** | 10% | OSRM distance comparison | Ratio vs shortest route: ≤1.0x=100, ≤1.15x=88, ≤1.3x=72, ≤1.5x=52, >1.8x=12 |
| **Community** | 5% | MongoDB RouteRating | Average user ratings (1–5 stars) converted to 0–100 scale, with area-based caching |

**Formula:**
```
Total = Crime×0.30 + Lighting×0.25 + Crowd×0.20 + Weather×0.10 + Efficiency×0.10 + Community×0.05
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT | ❌ |

### User

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/user/me` | Get current user profile | ✅ |
| `PUT` | `/api/user/profile` | Update profile details | ✅ |

### Route Planning

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/route/safe-routes` | Get scored safe routes (body: `sourceLat`, `sourceLng`, `destLat`, `destLng`) | ✅ |

### Journey

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/journey/start` | Start a new journey | ✅ |
| `GET` | `/api/journey/active` | Get current active journey | ✅ |
| `PUT` | `/api/journey/:id/end` | End a journey | ✅ |

### SOS

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/sos/trigger` | Trigger SOS — sends SMS + calls + police alert | ✅ |
| `GET` | `/api/sos/history` | Get SOS event history | ✅ |

### Community Ratings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ratings` | Submit a route rating | ✅ |
| `GET` | `/api/ratings` | Fetch community ratings feed | ✅ |

### Loved Ones

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/lovedones` | List all emergency contacts | ✅ |
| `POST` | `/api/lovedones` | Add a new contact | ✅ |
| `DELETE` | `/api/lovedones/:id` | Remove a contact | ✅ |

### Points of Interest

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/poi/nearby` | Fetch nearby hospitals, police, pharmacies | ✅ |

### Health Check

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Server health status | ❌ |

---

## 🗄️ Database Schema

### User
```javascript
{
  fullName:          String (required),
  email:             String (required, unique, lowercase),
  password:          String (required, bcrypt hashed),
  phone:             String (required),
  address:           String,
  profilePhoto:      String (base64),
  isProfileComplete: Boolean (default: false),
  createdAt:         Date
}
```

### CrimeZone (GeoJSON)
```javascript
{
  name:          String,
  city:          String,
  crimeScore:    Number (0–100),
  lightingScore: Number (0–100),
  crowdScore:    Number (0–100),
  areaType:      Enum ['commercial','residential','industrial','mixed','public','government'],
  type:          Enum ['high','medium','low'],
  incidentCount: Number,
  geometry: {
    type:        'Polygon',
    coordinates: [[[Number]]]    // 2dsphere indexed
  }
}
```

### Journey
```javascript
{
  userId:            ObjectId → User,
  source:            { name, coordinates: { lat, lng } },
  destination:       { name, coordinates: { lat, lng } },
  selectedRoute:     Enum ['safe','medium','risky'],
  safetyScore:       Number,
  status:            Enum ['active','paused','completed','sos'],
  locationHistory:   [{ lat, lng, timestamp }],
  lastLocationUpdate: Date,
  startedAt:         Date,
  endedAt:           Date
}
```

### SOSLog
```javascript
{
  userId:               ObjectId → User,
  triggerType:           Enum ['manual','auto'],
  location:             { lat, lng },
  contactsNotified:     [String],     // phone numbers
  nearestPoliceStation: { name, phone, lat, lng },
  createdAt:            Date
}
```

---

## 🔄 Real-Time Communication

Safelle uses **Socket.IO** for real-time bidirectional communication during active journeys.

### Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `journey:join` | Client → Server | `journeyId` | Join a journey room |
| `location:send` | Client → Server | `{ journeyId, lat, lng, heading }` | Send GPS location update |
| `location:update` | Server → Client | `{ lat, lng, heading, timestamp }` | Broadcast location to room |
| `journey:checkin` | Server → Client | `{ message, timestamp }` | 5-min inactivity warning |
| `journey:freeze_warning` | Server → Client | `{ message, vibrate }` | No-movement vibration alert |
| `journey:confirm_safe` | Client → Server | `journeyId` | User confirms safety |
| `sos:trigger` | Client → Server | `{ journeyId, lat, lng, type, userId }` | Manual/auto SOS trigger |
| `journey:sos` | Server → Client | `{ contacts, policeStation, location, ... }` | SOS activation broadcast |
| `journey:leave` | Client → Server | `journeyId` | Leave journey room |

### Dead Man's Switch Flow

```
User starts journey
        │
        ▼
  ┌─────────────┐
  │ Timer starts │ (5 min)
  │ on join/     │
  │ location     │
  └──────┬──────┘
         │
    5 min pass, no update
         │
         ▼
  ┌──────────────┐
  │ Check-in     │ ← "Are you okay?" + vibration
  │ prompt sent  │
  └──────┬───────┘
         │
    User responds ──────► Timer resets ──► Loop
         │
    5 more min (total 10)
         │
         ▼
  ┌──────────────┐
  │ AUTO SOS     │ ← SMS + Calls + Police alert
  │ TRIGGERED    │
  └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (or local MongoDB)
- **Twilio** account (for SMS/voice calls)
- **OpenWeatherMap** API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/safellee.git
cd safellee

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install

# 4. Return to root
cd ..
```

### Configuration

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key
OPENWEATHER_API_KEY=your_openweather_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

### Seed the Database

Populate crime zone data for demonstration:

```bash
cd server
npm run seed
```

### Run the Application

```bash
# Terminal 1 — Start the backend server
cd server
npm run dev          # runs on http://localhost:5000

# Terminal 2 — Start the frontend dev server
cd client
npm run dev          # runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Backend server port (default: `5000`) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `OPENWEATHER_API_KEY` | ✅ | OpenWeatherMap API key for weather scoring |
| `CLIENT_URL` | ✅ | Frontend URL for CORS configuration |
| `NODE_ENV` | ❌ | `development` or `production` |
| `TWILIO_ACCOUNT_SID` | ✅ | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | ✅ | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | ✅ | Twilio phone number for sending SMS/calls |

---

## 📈 Feasibility Analysis

### Technical Feasibility

| Aspect | Assessment | Details |
|--------|------------|---------|
| **Frontend** | ✅ Fully Feasible | React 19 + Vite provides a modern, performant SPA stack. Leaflet.js handles all map rendering client-side. |
| **Backend** | ✅ Fully Feasible | Express.js is production-proven for REST APIs. Socket.IO handles real-time needs gracefully. |
| **Database** | ✅ Fully Feasible | MongoDB's GeoJSON support with `2dsphere` indexing is purpose-built for geospatial queries on crime zones. |
| **Maps & Routing** | ✅ Fully Feasible | OSRM is a free, open-source routing engine. Overpass API provides free OSM data access. |
| **Emergency Alerts** | ✅ Fully Feasible | Twilio's programmable SMS and Voice APIs provide reliable, global delivery with Indian phone number support. |
| **Real-Time Tracking** | ✅ Fully Feasible | Socket.IO's WebSocket fallback guarantees connectivity across all browsers and network conditions. |
| **Scalability** | ⚠️ Moderate | In-memory caching (Map) works for single-server. Redis would be needed for multi-server deployment. |
| **Mobile Deployment** | ⚠️ Moderate | Capacitor config exists for wrapping the web app as a native APK, but native GPS/call features would need native bridges. |

### Operational Feasibility

| Factor | Status |
|--------|--------|
| **Cost** | Low — All core APIs (OSRM, Overpass, Nominatim) are free. Twilio has a pay-as-you-go model (~$0.01/SMS). OpenWeatherMap free tier allows 1,000 calls/day. |
| **User Adoption** | High — The app solves a critical, everyday problem for women commuters. One-tap SOS and automatic alerts lower the barrier to use. |
| **Maintenance** | Low — Stateless JWT auth, no session management. MongoDB Atlas handles backups. Crime zone data can be updated via the seed script. |
| **Compliance** | Location data is stored only during active journeys. No third-party tracking. SOS logs are maintained for user safety audit. |

### Market Feasibility

| Factor | Details |
|--------|---------|
| **Target Audience** | Women commuters, college students, night-shift workers across Indian cities |
| **Differentiator** | Safety-first scoring (vs speed-first in Google Maps), automated SOS, dead man's switch — no competitor offers all three |
| **Monetization Potential** | Freemium model — free core features, premium for family location sharing, corporate safety packages |

---

## 🗓️ Future Roadmap

- [ ] 📱 **Native Mobile App** — Full Android/iOS app via React Native or Capacitor build
- [ ] 🤖 **ML-Powered Crime Prediction** — Train models on historical crime data to predict risk by time and location
- [ ] 🌐 **Multi-Language Support** — Hindi, Tamil, Telugu, Bengali UI translations
- [ ] 📹 **Video Evidence Recording** — Auto-record video/audio during SOS events
- [ ] 🔔 **Push Notifications** — Firebase Cloud Messaging for SOS alerts to loved ones
- [ ] 🏢 **Corporate Dashboard** — Employer safety monitoring for women employees during late shifts
- [ ] 🗺️ **Offline Maps** — Pre-downloaded route tiles for areas with poor connectivity
- [ ] 🔗 **Wearable Integration** — Smartwatch SOS trigger and heart rate anomaly detection
- [ ] 🛡️ **NCRB Integration** — Pull real-time crime data from the National Crime Records Bureau API (when available)

---

## 👥 Contributors

| Name | Role |
|------|------|
| **Kaushal Dubey** | Full-Stack Developer |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>🛡️ Safelle — Because every woman deserves to reach home safely.</strong>
</p>
