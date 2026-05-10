# Smart Parking System

> An end-to-end IoT parking system: **Arduino sensors** detect whether each parking spot is free or occupied, a **Raspberry Pi** collects the data and serves a REST API, and a **React Native mobile app** visualises live availability, historical statistics, and short-term predictions.

A team project by **[Jakub Antala](https://github.com/JakubAntala)** and **[Martin Molnár](https://github.com/MartinMolnar78)** — Applied Informatics, UKF Nitra.

<p align="center">
  <img src="Screenshots%20of%20APP/homescreen.png" alt="Home screen" width="200">
  <img src="Screenshots%20of%20APP/parkingspots.png" alt="Parking spots view" width="200">
  <img src="Screenshots%20of%20APP/homescreenstats1.png" alt="Statistics" width="200">
  <img src="Screenshots%20of%20APP/homescreenstats2.png" alt="Statistics — predictions" width="200">
</p>

---

## What it does

-  **Live occupancy** — every spot reports `free` / `occupied` in real time
-  **Historical statistics** — occupancy by hour and day of week
-  **Predictions** — probability that a given spot will be free at a chosen hour
-  **Multi-floor support** — parking is split into floors, each with its own capacity and spot layout
-  **Cross-platform app** — runs on Android, iOS, and the web from a single React Native codebase

## System architecture

```
   ┌──────────────────┐  serial  ┌────────────────────┐   REST   ┌────────────────┐
   │   Arduino        │ ───────▶ │   Raspberry Pi     │ ───────▶ │  Mobile / Web  │
   │ Ultrasonic       │  USB     │  FastAPI + SQLite  │  HTTP    │  React Native  │
   │ sensors (HC-SR04)│          │  serial_to_db.py   │          │     (Expo)     │
   └──────────────────┘          └────────────────────┘          └────────────────┘
```

1. **Arduino** continuously reads ultrasonic distance sensors above each parking spot. A spot is reported as `occupied` when the distance drops below the threshold for several consecutive readings (debouncing via `REQUIRED_CONFIRMATIONS`).
2. **Raspberry Pi** receives the readings over serial (`/dev/ttyUSB0`, 115200 baud), writes them into a local SQLite database, and exposes them through a FastAPI REST API.
3. **Mobile app** consumes the API and renders live spot status, historical charts, and prediction views.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Sensors | Arduino (C++), HC-SR04 ultrasonic distance sensors |
| Edge / server | Raspberry Pi, Python 3, **FastAPI**, SQLite |
| App | **React Native** + **Expo**, TypeScript, Expo Router, React Navigation |
| Communication | UART/serial (Arduino ↔ RPi), REST/HTTP (RPi ↔ App) |

## Repository layout

```
├── Arduino/
│   ├── parkingsenzors.ino       # Sensor firmware (C++)
│   └── schemazapojenia.png      # Wiring diagram
├── Raspberry/
│   ├── main.py                  # FastAPI REST API
│   ├── serial_to_db.py          # Arduino → SQLite bridge
│   ├── init_db.py               # Database initialisation
│   ├── schema.sql               # SQLite schema
│   └── parking.db               # Local database (development)
├── ParkingSystemApp/             # React Native (Expo) app
│   ├── app/                      # Expo Router screens
│   ├── components/               # Reusable UI components
│   ├── services/                 # API client
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # TypeScript types
│   └── package.json
├── Documentation/
│   ├── AntalaMolnar_Final.pdf   # Full project documentation
│   └── SmartParkingSystem.pptx  # Project presentation
├── Screenshots of APP/           # App screenshots
└── README.md
```

## Data model (excerpt)

The SQLite schema models the parking domain across six tables:

- `floors` — floors with capacity
- `parking_spaces` — individual spots, organised by floor and side (`top` / `right` / `bottom` / `left`) for layout rendering
- `current_space_status` — most recent status of each spot
- `space_status_history` — full history of status changes
- `historical_occupancy_by_hour` — pre-aggregated stats per hour × day-of-week
- `spot_predictions` — predicted probability of each spot being occupied at a given hour

See [`Raspberry/schema.sql`](Raspberry/schema.sql) for the full definition.

## Getting started

### Prerequisites

- **Arduino** board with three HC-SR04 ultrasonic sensors (default pins: `TRIG = 2,4,6`, `ECHO = 3,5,7`) — wiring diagram in [`Arduino/schemazapojenia.png`](Arduino/schemazapojenia.png)
- **Raspberry Pi** (or any Linux machine for development) with Python 3.10+
- **Node.js 18+** and the **Expo CLI** for the mobile app

### 1) Flash the Arduino

Open `Arduino/parkingsenzors.ino` in the Arduino IDE, select your board, and upload.

### 2) Run the Raspberry Pi backend

```bash
cd Raspberry
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn pyserial

# Initialise the database (first run only)
python init_db.py

# Bridge serial data into the DB (runs continuously)
python serial_to_db.py &

# Start the REST API
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API is now reachable at `http://<raspberry-ip>:8000`. Check `GET /api/health` and `GET /api/live-spots`.

### 3) Run the mobile app

```bash
cd ParkingSystemApp
npm install
npx expo start
```

Press `a` for Android, `i` for iOS, or `w` for web. Make sure the API base URL in `services/` points at your Raspberry Pi.

## API endpoints (summary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Service health check |
| `GET`  | `/api/live-spots` | Current status of every parking spot |
| `GET`  | `/api/stats/hourly` | Historical occupancy by hour and day |
| `GET`  | `/api/predictions` | Predicted spot availability |

> Endpoints reflect the current implementation in `Raspberry/main.py` — see the file for exact request/response shapes.

## Documentation

Full project documentation and the project presentation are available in [`Documentation/`](Documentation):

- **[AntalaMolnar_Final.pdf](Documentation/AntalaMolnar_Final.pdf)** — written documentation
- **[SmartParkingSystem.pptx](Documentation/SmartParkingSystem.pptx)** — slide deck

## What we learned

- Designing a system that spans hardware, edge, and client — and keeping the contracts between layers clean
- Debouncing noisy sensor readings to get reliable `occupied` / `free` decisions
- Building a REST API with FastAPI and modelling time-series data in SQLite
- Building a cross-platform React Native app with Expo and TypeScript
- Working in a small team with version control, division of responsibilities, and code review

## Authors

- **Jakub Antala** — [@JakubAntala](https://github.com/JakubAntala)
- **Martin Molnár** — [@MartinMolnar78](https://github.com/MartinMolnar78)

Applied Informatics · Constantine the Philosopher University in Nitra (UKF)

---

<sub>🇸🇰 <em>Smart Parking System — IoT projekt: Arduino so senzormi sleduje obsadenosť parkovacích miest, Raspberry Pi cez FastAPI poskytuje REST API a SQLite databázu, React Native (Expo) aplikácia zobrazuje živý stav, štatistiky a predikcie. Tímový projekt Jakub Antala a Martin Molnár, UKF Nitra.</em></sub>
