import { HourValue } from "./stats";

export type ParkingFloor = 1 | 2 | 3;

export type SpotPrediction = {
  id: string;
  floor: ParkingFloor;
  label: string;
  probabilityOccupied: number;
};

export type FloorPrediction = {
  floor: ParkingFloor;
  hour: HourValue;
  predictedOccupied: number;
  predictedFree: number;
  occupancyPercent: number;
  recommendedSpots: SpotPrediction[];
};
