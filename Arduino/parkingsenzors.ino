const byte SENSOR_COUNT = 3;

const byte TRIG_PINS[SENSOR_COUNT] = {2, 4, 6};
const byte ECHO_PINS[SENSOR_COUNT] = {3, 5, 7};

const float OCCUPIED_BELOW_CM[SENSOR_COUNT] = {15, 15, 15};
const float FREE_ABOVE_CM[SENSOR_COUNT]     = {25.0, 25.0, 25.0};

const byte REQUIRED_CONFIRMATIONS = 3;

struct SensorState {
  float lastCm;
  bool initialized;
  bool stableOccupied;
  bool candidateOccupied;
  byte candidateCount;
};

SensorState sensorStates[SENSOR_COUNT];

float readDistanceCm(byte trigPin, byte echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  unsigned long duration = pulseIn(echoPin, HIGH, 25000UL);

  if (duration == 0) {
    return -1.0;
  }

  return (duration * 0.0343f) / 2.0f;
}

void sort3(float &a, float &b, float &c) {
  if (a > b) { float t = a; a = b; b = t; }
  if (b > c) { float t = b; b = c; c = t; }
  if (a > b) { float t = a; a = b; b = t; }
}

float readFilteredDistanceCm(byte sensorIndex) {
  float values[3];
  byte validCount = 0;

  for (byte i = 0; i < 3; i++) {
    float cm = readDistanceCm(TRIG_PINS[sensorIndex], ECHO_PINS[sensorIndex]);

    if (cm > 0) {
      values[validCount++] = cm;
    }

    delay(35);
  }

  if (validCount == 0) return -1.0;
  if (validCount == 1) return values[0];
  if (validCount == 2) return (values[0] + values[1]) / 2.0f;

  float a = values[0];
  float b = values[1];
  float c = values[2];
  sort3(a, b, c);
  return b;
}

bool classifyWithHysteresis(byte i, float cm) {
  if (!sensorStates[i].initialized) {
    return cm <= OCCUPIED_BELOW_CM[i];
  }

  if (sensorStates[i].stableOccupied) {
    if (cm >= FREE_ABOVE_CM[i]) return false;
    return true;
  } else {
    if (cm <= OCCUPIED_BELOW_CM[i]) return true;
    return false;
  }
}

void updateDebouncedState(byte i, float cm) {
  sensorStates[i].lastCm = cm;

  if (cm < 0) {
    bool rawOccupied = false;

    if (!sensorStates[i].initialized) {
      sensorStates[i].initialized = true;
      sensorStates[i].stableOccupied = rawOccupied;
      sensorStates[i].candidateOccupied = rawOccupied;
      sensorStates[i].candidateCount = 0;
      return;
    }

    if (rawOccupied == sensorStates[i].stableOccupied) {
      sensorStates[i].candidateOccupied = rawOccupied;
      sensorStates[i].candidateCount = 0;
      return;
    }

    if (rawOccupied != sensorStates[i].candidateOccupied) {
      sensorStates[i].candidateOccupied = rawOccupied;
      sensorStates[i].candidateCount = 1;
      return;
    }

    sensorStates[i].candidateCount++;

    if (sensorStates[i].candidateCount >= REQUIRED_CONFIRMATIONS) {
      sensorStates[i].stableOccupied = rawOccupied;
      sensorStates[i].candidateCount = 0;
    }
    return;
  }

  bool rawOccupied = classifyWithHysteresis(i, cm);

  if (!sensorStates[i].initialized) {
    sensorStates[i].initialized = true;
    sensorStates[i].stableOccupied = rawOccupied;
    sensorStates[i].candidateOccupied = rawOccupied;
    sensorStates[i].candidateCount = 0;
    return;
  }

  if (rawOccupied == sensorStates[i].stableOccupied) {
    sensorStates[i].candidateOccupied = rawOccupied;
    sensorStates[i].candidateCount = 0;
    return;
  }

  if (rawOccupied != sensorStates[i].candidateOccupied) {
    sensorStates[i].candidateOccupied = rawOccupied;
    sensorStates[i].candidateCount = 1;
    return;
  }

  sensorStates[i].candidateCount++;

  if (sensorStates[i].candidateCount >= REQUIRED_CONFIRMATIONS) {
    sensorStates[i].stableOccupied = rawOccupied;
    sensorStates[i].candidateCount = 0;
  }
}

void printCsvLine() {
  Serial.print("DATA");

  for (byte i = 0; i < SENSOR_COUNT; i++) {
    Serial.print(",");

    if (sensorStates[i].lastCm < 0) {
      Serial.print("NO_ECHO");
    } else {
      Serial.print(sensorStates[i].lastCm, 1);
    }

    Serial.print(",");
    Serial.print(sensorStates[i].stableOccupied ? "occupied" : "free");
  }

  Serial.println();
}

void setup() {
  Serial.begin(115200);

  for (byte i = 0; i < SENSOR_COUNT; i++) {
    pinMode(TRIG_PINS[i], OUTPUT);
    pinMode(ECHO_PINS[i], INPUT);
    digitalWrite(TRIG_PINS[i], LOW);

    sensorStates[i].lastCm = -1.0;
    sensorStates[i].initialized = false;
    sensorStates[i].stableOccupied = false;
    sensorStates[i].candidateOccupied = false;
    sensorStates[i].candidateCount = 0;
  }

  delay(1000);
  Serial.println("START");
}

void loop() {
  for (byte i = 0; i < SENSOR_COUNT; i++) {
    float cm = readFilteredDistanceCm(i);
    updateDebouncedState(i, cm);
  }

  printCsvLine();
  delay(200);
}