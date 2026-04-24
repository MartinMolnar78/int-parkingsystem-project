import {
  fetchHistoricalOccupancyByHour,
  HOURS,
} from "../services/parkingApi";
import {
  HistoricalOccupancyByHour,
  HourValue,
} from "../types/stats";

export const TOTAL_SPOTS = 36;
export { HOURS };

export const getHistoricalOccupancyByHour =
  async (): Promise<HistoricalOccupancyByHour> => {
    return fetchHistoricalOccupancyByHour();
  };

export const getAverageCarsForHour = async (hour: HourValue) => {
  const historicalOccupancyByHour = await fetchHistoricalOccupancyByHour();
  const data = historicalOccupancyByHour[hour] ?? [];
  const totalCars = data.reduce((sum, item) => sum + item.cars, 0);
  return Number((totalCars / data.length).toFixed(0));
};

export const getAverageOccupancyPercentForHour = async (hour: HourValue) => {
  const averageCars = await getAverageCarsForHour(hour);
  return Math.round((averageCars / TOTAL_SPOTS) * 100);
};