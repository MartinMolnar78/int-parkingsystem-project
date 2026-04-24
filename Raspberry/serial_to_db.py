import sqlite3
import serial
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "parking.db"

SERIAL_PORT = "/dev/ttyUSB0"   
BAUD_RATE = 115200

SENSOR_TO_SPACE = {
    1: "P1-02",
    2: "P2-04",
    3: "P3-07",
}


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def ensure_current_status_table(conn: sqlite3.Connection):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS current_space_status (
          space_id TEXT PRIMARY KEY,
          status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
          measured_at TEXT NOT NULL,
          source TEXT NOT NULL DEFAULT 'arduino',
          FOREIGN KEY (space_id) REFERENCES parking_spaces(id) ON DELETE CASCADE
        )
        """
    )
    conn.commit()


def parse_cm_value(cm_raw: str):
    """
    Podporované vstupy:
    - "12.4"
    - "-1"
    - "NO_ECHO"
    """
    cm_raw = cm_raw.strip()

    if cm_raw == "NO_ECHO":
        return None

    try:
        cm = float(cm_raw)
    except ValueError:
        return None

    if cm < 0:
        return None

    return cm


def parse_line(line: str):
    parts = line.strip().split(",")

    if len(parts) != 7:
        return None

    if parts[0] != "DATA":
        return None

    result = {}

    for sensor_index in range(1, 4):
        cm_raw = parts[(sensor_index - 1) * 2 + 1].strip()
        state = parts[(sensor_index - 1) * 2 + 2].strip()

        if state not in ("free", "occupied"):
            return None

        cm = parse_cm_value(cm_raw)

        result[sensor_index] = {
            "cm": cm,          # None = NO_ECHO / neplatné meranie
            "status": state,
        }

    return result


def get_current_db_status(conn: sqlite3.Connection, space_id: str):
    row = conn.execute(
        "SELECT status FROM current_space_status WHERE space_id = ?",
        (space_id,),
    ).fetchone()

    return row["status"] if row else None


def write_status_if_changed(conn: sqlite3.Connection, space_id: str, status: str):
    current_status = get_current_db_status(conn, space_id)

    if current_status == status:
        return False

    now_iso = datetime.now(timezone.utc).isoformat()

    conn.execute(
        """
        INSERT INTO space_status_history (space_id, status, measured_at)
        VALUES (?, ?, ?)
        """,
        (space_id, status, now_iso),
    )

    conn.execute(
        """
        INSERT INTO current_space_status (space_id, status, measured_at, source)
        VALUES (?, ?, ?, 'arduino')
        ON CONFLICT(space_id) DO UPDATE SET
          status = excluded.status,
          measured_at = excluded.measured_at,
          source = excluded.source
        """,
        (space_id, status, now_iso),
    )

    conn.commit()
    return True


def main():
    conn = get_conn()
    ensure_current_status_table(conn)

    print(f"Opening serial: {SERIAL_PORT} @ {BAUD_RATE}")
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)

    try:
        while True:
            raw = ser.readline()
            if not raw:
                continue

            try:
                line = raw.decode("utf-8", errors="ignore").strip()
            except Exception:
                continue

            if not line:
                continue

            if line == "START":
                print("Arduino started")
                continue

            parsed = parse_line(line)
            if not parsed:
                print(f"Ignored line: {line}")
                continue

            for sensor_index, payload in parsed.items():
                if sensor_index not in SENSOR_TO_SPACE:
                    print(f"Unknown sensor index: {sensor_index}")
                    continue

                space_id = SENSOR_TO_SPACE[sensor_index]
                status = payload["status"]
                cm = payload["cm"]

                changed = write_status_if_changed(conn, space_id, status)

                cm_text = "NO_ECHO" if cm is None else f"{cm:.1f} cm"

                print(
                    f"S{sensor_index} -> {space_id} | {cm_text} | {status}"
                    + (" | DB updated" if changed else " | no change")
                )

    except KeyboardInterrupt:
        print("\nStopping...")

    finally:
        ser.close()
        conn.close()


if __name__ == "__main__":
    main()
