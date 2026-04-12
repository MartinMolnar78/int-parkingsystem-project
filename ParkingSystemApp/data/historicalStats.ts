import {
    DayOccupancy,
    HistoricalOccupancyByHour,
    HourValue,
    WeekDayKey,
} from "../types/stats";

export const TOTAL_SPOTS = 36;

export const HOURS: HourValue[] = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

const WEEK_DAYS: Array<{
  key: WeekDayKey;
  label: string;
  modifier: number;
  offset: number;
}> = [
  { key: "monday", label: "Po", modifier: 1.0, offset: 0 },
  { key: "tuesday", label: "Ut", modifier: 1.05, offset: 1 },
  { key: "wednesday", label: "St", modifier: 0.97, offset: -1 },
  { key: "thursday", label: "Št", modifier: 1.08, offset: 1 },
  { key: "friday", label: "Pi", modifier: 1.12, offset: 2 },
  { key: "saturday", label: "So", modifier: 0.72, offset: -2 },
  { key: "sunday", label: "Ne", modifier: 0.48, offset: -3 },
];

const BASE_BY_HOUR: Record<HourValue, number> = {
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
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const createHourData = (hour: HourValue): DayOccupancy[] => {
  return WEEK_DAYS.map((day) => {
    const rawCars = BASE_BY_HOUR[hour] * day.modifier + day.offset;
    const cars = clamp(Math.round(rawCars), 0, TOTAL_SPOTS);

    return {
      key: day.key,
      label: day.label,
      cars,
    };
  });
};

export const historicalOccupancyByHour: HistoricalOccupancyByHour =
  HOURS.reduce((acc, hour) => {
    acc[hour] = createHourData(hour);
    return acc;
  }, {} as HistoricalOccupancyByHour);

export const getAverageCarsForHour = (hour: HourValue) => {
  const data = historicalOccupancyByHour[hour];
  const totalCars = data.reduce((sum, item) => sum + item.cars, 0);
  return Number((totalCars / data.length).toFixed(0));
};

export const getAverageOccupancyPercentForHour = (hour: HourValue) => {
  const averageCars = getAverageCarsForHour(hour);
  return Math.round((averageCars / TOTAL_SPOTS) * 100);
};
