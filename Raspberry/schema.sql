PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS floors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity >= 0)
);

CREATE TABLE IF NOT EXISTS parking_spaces (
  id TEXT PRIMARY KEY,
  floor_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('top', 'right', 'bottom', 'left')),
  display_order INTEGER NOT NULL,
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
  UNIQUE (floor_id, label)
);

CREATE TABLE IF NOT EXISTS space_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
  measured_at TEXT NOT NULL,
  FOREIGN KEY (space_id) REFERENCES parking_spaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_space_status_history_space_time
ON space_status_history (space_id, measured_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS historical_occupancy_by_hour (
  hour INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
  day_key TEXT NOT NULL CHECK (
    day_key IN (
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    )
  ),
  day_label TEXT NOT NULL,
  cars INTEGER NOT NULL CHECK (cars >= 0),
  PRIMARY KEY (hour, day_key)
);

CREATE TABLE IF NOT EXISTS spot_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  floor_id INTEGER NOT NULL,
  hour INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
  space_label TEXT NOT NULL,
  probability_occupied REAL NOT NULL CHECK (
    probability_occupied >= 0 AND probability_occupied <= 1
  ),
  created_at TEXT NOT NULL,
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
  UNIQUE (floor_id, hour, space_label)
);

CREATE INDEX IF NOT EXISTS idx_spot_predictions_floor_hour
ON spot_predictions (floor_id, hour);


CREATE TABLE IF NOT EXISTS current_space_status (
  space_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
  measured_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'arduino',
  FOREIGN KEY (space_id) REFERENCES parking_spaces(id) ON DELETE CASCADE
);
