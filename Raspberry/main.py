import sqlite3
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "parking.db"

HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
DAY_ORDER = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]

app = FastAPI(title="Parking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/live-spots")
def get_live_spots():
    conn = get_conn()

    rows = conn.execute(
        """
        SELECT
            ps.id,
            ps.floor_id,
            ps.label,
            ps.side,
            ps.display_order,
            COALESCE(
              (
                SELECT ssh.status
                FROM space_status_history ssh
                WHERE ssh.space_id = ps.id
                ORDER BY ssh.measured_at DESC, ssh.id DESC
                LIMIT 1
              ),
              'free'
            ) AS status
        FROM parking_spaces ps
        ORDER BY ps.floor_id, ps.display_order
        """
    ).fetchall()

    conn.close()

    result: Dict[int, List[dict]] = {1: [], 2: [], 3: []}

    for row in rows:
        result[row["floor_id"]].append(
            {
                "id": row["id"],
                "floor": row["floor_id"],
                "label": row["label"],
                "side": row["side"],
                "order": row["display_order"],
                "status": row["status"],
            }
        )

    return result


@app.get("/api/historical")
def get_historical():
    conn = get_conn()

    rows = conn.execute(
        """
        SELECT hour, day_key, day_label, cars
        FROM historical_occupancy_by_hour
        ORDER BY hour
        """
    ).fetchall()

    conn.close()

    result = {hour: [] for hour in HOURS}

    grouped = {}
    for row in rows:
        hour = row["hour"]
        grouped.setdefault(hour, []).append(
            {
                "key": row["day_key"],
                "label": row["day_label"],
                "cars": row["cars"],
            }
        )

    for hour in HOURS:
        day_items = grouped.get(hour, [])
        day_items.sort(key=lambda item: DAY_ORDER.index(item["key"]))
        result[hour] = day_items

    return result


@app.get("/api/predictions")
def get_predictions(hour: int):
    if hour not in HOURS:
        raise HTTPException(status_code=400, detail=f"hour must be one of {HOURS}")

    conn = get_conn()

    rows = conn.execute(
        """
        SELECT
            floor_id,
            space_label,
            probability_occupied
        FROM spot_predictions
        WHERE hour = ?
        ORDER BY floor_id, space_label
        """,
        (hour,),
    ).fetchall()

    conn.close()

    by_floor = {1: [], 2: [], 3: []}

    for row in rows:
        spot = {
            "id": f"P{row['floor_id']}-{row['space_label']}",
            "floor": row["floor_id"],
            "label": row["space_label"],
            "probabilityOccupied": round(row["probability_occupied"], 2),
        }
        by_floor[row["floor_id"]].append(spot)

    result = []

    for floor in [1, 2, 3]:
        spots = by_floor[floor]
        predicted_occupied = round(sum(item["probabilityOccupied"] for item in spots))
        predicted_free = 12 - predicted_occupied
        occupancy_percent = round((predicted_occupied / 12) * 100)

        recommended_spots = sorted(
            spots,
            key=lambda item: item["probabilityOccupied"],
        )[:4]

        result.append(
            {
                "floor": floor,
                "hour": hour,
                "predictedOccupied": predicted_occupied,
                "predictedFree": predicted_free,
                "occupancyPercent": occupancy_percent,
                "recommendedSpots": recommended_spots,
            }
        )

    return result


@app.post("/api/mock-status/{space_id}")
def update_spot_status(space_id: str, status: str):
    if status not in ("free", "occupied"):
        raise HTTPException(
            status_code=400,
            detail="status must be 'free' or 'occupied'",
        )

    conn = get_conn()

    space = conn.execute(
        "SELECT id FROM parking_spaces WHERE id = ?",
        (space_id,),
    ).fetchone()

    if not space:
        conn.close()
        raise HTTPException(status_code=404, detail="Space not found")

    now_iso = datetime.now(timezone.utc).isoformat()

    conn.execute(
        """
        INSERT INTO space_status_history (space_id, status, measured_at)
        VALUES (?, ?, ?)
        """,
        (space_id, status, now_iso),
    )

    conn.commit()
    conn.close()

    return {
        "ok": True,
        "spaceId": space_id,
        "status": status,
        "measuredAt": now_iso,
    }