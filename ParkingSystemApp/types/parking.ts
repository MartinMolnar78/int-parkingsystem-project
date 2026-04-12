export type SpotStatus = "free" | "occupied";
export type Side = "top" | "right" | "bottom" | "left";

export type Spot = {
  id: string;
  floor: 1 | 2 | 3;
  label: string;
  status: SpotStatus;
  side: Side;
  order: number;
};
