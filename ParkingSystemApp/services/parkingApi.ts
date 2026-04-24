import { API_BASE_URL } from "../config/api";
import { Spot } from "../types/parking";
import { FloorPrediction } from "../types/prediction";
import {
    HistoricalOccupancyByHour,
    HourValue,
} from "../types/stats";

export const HOURS: HourValue[] = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

async function handleJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchParkingData(): Promise<Record<1 | 2 | 3, Spot[]>> {
  const response = await fetch(`${API_BASE_URL}/api/live-spots`);
  return handleJson<Record<1 | 2 | 3, Spot[]>>(response);
}

export async function fetchHistoricalOccupancyByHour(): Promise<HistoricalOccupancyByHour> {
  const response = await fetch(`${API_BASE_URL}/api/historical`);
  return handleJson<HistoricalOccupancyByHour>(response);
}

export async function fetchPredictionsForHour(
  hour: HourValue,
): Promise<FloorPrediction[]> {
  const response = await fetch(`${API_BASE_URL}/api/predictions?hour=${hour}`);
  return handleJson<FloorPrediction[]>(response);
}

export async function updateSpotStatus(
  spaceId: string,
  status: "free" | "occupied",
) {
  const response = await fetch(
    `${API_BASE_URL}/api/mock-status/${spaceId}?status=${status}`,
    {
      method: "POST",
    },
  );

  return handleJson(response);
}