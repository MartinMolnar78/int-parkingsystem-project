import { fetchParkingData } from "../services/parkingApi";
import { Side, Spot } from "../types/parking";

export const getParkingData = async (): Promise<Record<1 | 2 | 3, Spot[]>> => {
  return fetchParkingData();
};

export const getFreeCount = (spots: Spot[]) =>
  spots.filter((spot) => spot.status === "free").length;

export const getSpotsBySide = (spots: Spot[], side: Side) =>
  spots.filter((spot) => spot.side === side);