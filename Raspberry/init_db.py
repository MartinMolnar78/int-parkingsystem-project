import sqlite3
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "parking.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"

HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

WEEK_DAYS = [
    {"key": "monday", "label": "Po", "modifier": 1.0, "offset": 0},
    {"key": "tuesday", "label": "Ut", "modifier": 1.05, "offset": 1},
    {"key": "wednesday", "label": "St", "modifier": 0.97, "offset": -1},
    {"key": "thursday", "label": "Št", "modifier": 1.08, "offset": 1},
    {"key": "friday", "label": "Pi", "modifier": 1.12, "offset": 2},
    {"key": "saturday", "label": "So", "modifier": 0.72, "offset": -2},
    {"key": "sunday", "label": "Ne", "modifier": 0.48, "offset": -3},
]

BASE_BY_HOUR = {
    6: 5,
    7: 11,
    8: 17,
    9: 23,
    10: 27,
    11: 29,
    12: 26,
    13: 24,
    14: 22,
    15: 24,
    16: 28,
    17: 31,
    18: 27,
    19: 18,
    20: 9,
}

SPOT_LAYOUT = [
    {"label": "01", "side": "top", "order": 1},
    {"label": "02", "side": "top", "order": 2},
    {"label": "03", "side": "top", "order": 3},
    {"label": "04", "side": "top", "order": 4},
    {"label": "05", "side": "right", "order": 1},
    {"label": "06", "side": "right", "order": 2},
    {"label": "07", "side": "bottom", "order": 1},
    {"label": "08", "side": "bottom", "order": 2},
    {"label": "09", "side": "bottom", "order": 3},
    {"label": "10", "side": "bottom", "order": 4},
    {"label": "11", "side": "left", "order": 1},
    {"label": "12", "side": "left", "order": 2},
]

INITIAL_OCCUPIED = {
    1: ["02", "05", "08", "11"],
    2: ["01", "04", "06", "09", "12"],
    3: ["03", "07", "10"],
}

BASE_LOAD_BY_HOUR = {
    6: 0.18,
    7: 0.32,
    8: 0.48,
    9: 0.62,
    10: 0.74,
    11: 0.78,
    12: 0.72,
    13: 0.68,
    14: 0.61,
    15: 0.66,
    16: 0.77,
    17: 0.84,
    18: 0.73,
    19: 0.49,
    20: 0.24,
}

FLOOR_MULTIPLIER = {
    1: 1.12,
    2: 1.0,
    3: 0.84,
}

SPOT_BIAS = {
    "01": 0.08,
    "02": 0.05,
    "03": 0.03,
    "04": 0.07,
    "05": 0.12,
    "06": 0.10,
    "07": -0.02,
    "08": -0.07,
    "09": -0.09,
    "10": -0.05,
    "11": -0.08,
    "12": -0.04,
}


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def create_historical_rows():
    rows = []
    for hour in HOURS:
        for day in WEEK_DAYS:
            raw_cars = BASE_BY_HOUR[hour] * day["modifier"] + day["offset"]
            cars = int(round(clamp(raw_cars, 0, 36)))
            rows.append((hour, day["key"], day["label"], cars))
    return rows


def get_spot_probability(floor: int, hour: int, label: str) -> float:
    base = BASE_LOAD_BY_HOUR[hour] * FLOOR_MULTIPLIER[floor]
    floor_offset = 0.03 if floor == 1 else (-0.03 if floor == 3 else 0)
    probability = clamp(base + floor_offset + SPOT_BIAS[label], 0.05, 0.95)
    return round(probability, 2)


def create_prediction_rows(now_iso: str):
    rows = []
    for floor in [1, 2, 3]:
        for hour in HOURS:
            for spot in SPOT_LAYOUT:
                probability = get_spot_probability(floor, hour, spot["label"])
                rows.append((floor, hour, spot["label"], probability, now_iso))
    return rows


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())

    conn.execute("DELETE FROM space_status_history")
    conn.execute("DELETE FROM spot_predictions")
    conn.execute("DELETE FROM historical_occupancy_by_hour")
    conn.execute("DELETE FROM parking_spaces")
    conn.execute("DELETE FROM floors")

    floors = [
        (1, "Floor 1", 12),
        (2, "Floor 2", 12),
        (3, "Floor 3", 12),
    ]
    conn.executemany(
        "INSERT INTO floors (id, name, capacity) VALUES (?, ?, ?)",
        floors,
    )

    spaces = []
    for floor in [1, 2, 3]:
        for item in SPOT_LAYOUT:
            spaces.append(
                (
                    f"P{floor}-{item['label']}",
                    floor,
                    item["label"],
                    item["side"],
                    item["order"],
                )
            )

    conn.executemany(
        """
        INSERT INTO parking_spaces (id, floor_id, label, side, display_order)
        VALUES (?, ?, ?, ?, ?)
        """,
        spaces,
    )

    now_iso = datetime.now(timezone.utc).isoformat()

    status_rows = []
    for floor in [1, 2, 3]:
        occupied_set = set(INITIAL_OCCUPIED[floor])
        for item in SPOT_LAYOUT:
            status = "occupied" if item["label"] in occupied_set else "free"
            status_rows.append((f"P{floor}-{item['label']}", status, now_iso))

    conn.executemany(
        """
        INSERT INTO space_status_history (space_id, status, measured_at)
        VALUES (?, ?, ?)
        """,
        status_rows,
    )

    conn.executemany(
        """
        INSERT INTO historical_occupancy_by_hour (hour, day_key, day_label, cars)
        VALUES (?, ?, ?, ?)
        """,
        create_historical_rows(),
    )

    conn.executemany(
        """
        INSERT INTO spot_predictions
        (floor_id, hour, space_label, probability_occupied, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        create_prediction_rows(now_iso),
    )

    conn.commit()
    conn.close()
    print(f"Hotovo. Databáza vytvorená: {DB_PATH}")


if __name__ == "__main__":
    main()
    