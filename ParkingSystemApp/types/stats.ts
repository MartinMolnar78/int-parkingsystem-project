export type WeekDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type HourValue =
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

export type DayOccupancy = {
  key: WeekDayKey;
  label: string;
  cars: number;
};

export type HistoricalOccupancyByHour = Record<HourValue, DayOccupancy[]>;
