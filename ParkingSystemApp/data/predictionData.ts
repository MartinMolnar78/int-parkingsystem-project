import { fetchPredictionsForHour } from "../services/parkingApi";
import {
  FloorPrediction,
  ParkingFloor,
} from "../types/prediction";
import { HourValue } from "../types/stats";

export const getPredictionsForHour = async (
  hour: HourValue,
): Promise<FloorPrediction[]> => {
  return fetchPredictionsForHour(hour);
};

export const getFloorPrediction = async (
  hour: HourValue,
  floor: ParkingFloor,
): Promise<FloorPrediction> => {
  const predictions = await fetchPredictionsForHour(hour);
  const match = predictions.find((item) => item.floor === floor);

  if (!match) {
    throw new Error(`Prediction for floor ${floor} not found`);
  }

  return match;
};