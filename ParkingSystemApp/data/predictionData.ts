import {
    FloorPrediction,
    ParkingFloor,
    SpotPrediction,
} from "../types/prediction";
import { HourValue } from "../types/stats";

const SPOTS_PER_FLOOR = 12;

const SPOT_LABELS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const BASE_LOAD_BY_HOUR: Record<HourValue, number> = {
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
};

const FLOOR_MULTIPLIER: Record<ParkingFloor, number> = {
  1: 1.12,
  2: 1.0,
  3: 0.84,
};

const SPOT_BIAS: Record<string, number> = {
  "01": 0.08,
  "02": 0.05,
  "03": 0.03,
  "04": 0.07,
  "05": 0.12,
  "06": 0.1,
  "07": -0.02,
  "08": -0.07,
  "09": -0.09,
  "10": -0.05,
  "11": -0.08,
  "12": -0.04,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const getSpotProbability = (
  floor: ParkingFloor,
  hour: HourValue,
  label: string,
) => {
  const base = BASE_LOAD_BY_HOUR[hour] * FLOOR_MULTIPLIER[floor];
  const floorOffset = floor === 1 ? 0.03 : floor === 3 ? -0.03 : 0;
  const probability = clamp(base + floorOffset + SPOT_BIAS[label], 0.05, 0.95);

  return Number(probability.toFixed(2));
};

const createSpotPrediction = (
  floor: ParkingFloor,
  hour: HourValue,
  label: string,
): SpotPrediction => {
  return {
    id: `P${floor}-${label}`,
    floor,
    label,
    probabilityOccupied: getSpotProbability(floor, hour, label),
  };
};

export const getFloorPrediction = (
  hour: HourValue,
  floor: ParkingFloor,
): FloorPrediction => {
  const allSpots = SPOT_LABELS.map((label) =>
    createSpotPrediction(floor, hour, label),
  );

  const predictedOccupied = Math.round(
    allSpots.reduce((sum, spot) => sum + spot.probabilityOccupied, 0),
  );

  const predictedFree = SPOTS_PER_FLOOR - predictedOccupied;

  const recommendedSpots = [...allSpots]
    .sort((a, b) => a.probabilityOccupied - b.probabilityOccupied)
    .slice(0, 4);

  return {
    floor,
    hour,
    predictedOccupied,
    predictedFree,
    occupancyPercent: Math.round((predictedOccupied / SPOTS_PER_FLOOR) * 100),
    recommendedSpots,
  };
};

export const getPredictionsForHour = (hour: HourValue): FloorPrediction[] => {
  return [1, 2, 3].map((floor) =>
    getFloorPrediction(hour, floor as ParkingFloor),
  );
};
