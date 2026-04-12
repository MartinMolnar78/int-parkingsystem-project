import { Side, Spot } from "../types/parking";

const spotLayout: Array<{ label: string; side: Side; order: number }> = [
  { label: "01", side: "top", order: 1 },
  { label: "02", side: "top", order: 2 },
  { label: "03", side: "top", order: 3 },
  { label: "04", side: "top", order: 4 },

  { label: "05", side: "right", order: 1 },
  { label: "06", side: "right", order: 2 },

  { label: "07", side: "bottom", order: 1 },
  { label: "08", side: "bottom", order: 2 },
  { label: "09", side: "bottom", order: 3 },
  { label: "10", side: "bottom", order: 4 },

  { label: "11", side: "left", order: 1 },
  { label: "12", side: "left", order: 2 },
];

const createFloorSpots = (
  floor: 1 | 2 | 3,
  occupiedLabels: string[],
): Spot[] => {
  return spotLayout.map((item) => ({
    id: `P${floor}-${item.label}`,
    floor,
    label: item.label,
    side: item.side,
    order: item.order,
    status: occupiedLabels.includes(item.label) ? "occupied" : "free",
  }));
};

export const parkingData: Record<1 | 2 | 3, Spot[]> = {
  1: createFloorSpots(1, ["02", "05", "08", "11"]),
  2: createFloorSpots(2, ["01", "04", "06", "09", "12"]),
  3: createFloorSpots(3, ["03", "07", "10"]),
};

export const getFreeCount = (spots: Spot[]) =>
  spots.filter((spot) => spot.status === "free").length;

export const getSpotsBySide = (spots: Spot[], side: Side) =>
  spots.filter((spot) => spot.side === side);
