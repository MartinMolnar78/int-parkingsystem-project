import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getSpotsBySide } from "../data/parkingData";
import { Spot } from "../types/parking";
import ParkingSpot from "./ParkingSpot";

type Props = {
  floor: 1 | 2 | 3;
  spots: Spot[];
};

const SPOT_WIDTH = 60;
const SPOT_HEIGHT = 110;
const GAP = 20;

const BOARD_WIDTH = SPOT_WIDTH * 4 + GAP * 3;
const MIDDLE_HEIGHT = SPOT_HEIGHT * 2 + GAP;

export default function ParkingFloorMap({ floor, spots }: Props) {
  const topSpots = getSpotsBySide(spots, "top");
  const rightSpots = getSpotsBySide(spots, "right");
  const bottomSpots = getSpotsBySide(spots, "bottom");
  const leftSpots = getSpotsBySide(spots, "left");

  return (
    <View style={styles.mapCard}>
      <View style={styles.board}>
        <View style={styles.topRow}>
          {topSpots.map((spot) => (
            <ParkingSpot key={spot.id} spot={spot} />
          ))}
        </View>

        <View style={styles.middleRow}>
          <View style={styles.sideColumn}>
            {leftSpots.map((spot) => (
              <ParkingSpot key={spot.id} spot={spot} />
            ))}
          </View>

          <View style={styles.roadArea}>
            <Text style={styles.roadText}>Jazdný pruh</Text>
            <Text style={styles.roadSubText}>Poschodie {floor}</Text>
          </View>

          <View style={styles.sideColumn}>
            {rightSpots.map((spot) => (
              <ParkingSpot key={spot.id} spot={spot} />
            ))}
          </View>
        </View>

        <View style={styles.bottomRow}>
          {bottomSpots.map((spot) => (
            <ParkingSpot key={spot.id} spot={spot} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  board: {
    width: BOARD_WIDTH,
    gap: GAP,
  },
  topRow: {
    width: BOARD_WIDTH,
    height: SPOT_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  middleRow: {
    width: BOARD_WIDTH,
    height: MIDDLE_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomRow: {
    width: BOARD_WIDTH,
    height: SPOT_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sideColumn: {
    width: SPOT_WIDTH,
    height: MIDDLE_HEIGHT,
    justifyContent: "space-between",
    alignItems: "center",
  },
  roadArea: {
    width: BOARD_WIDTH - SPOT_WIDTH * 2 - GAP * 2,
    height: MIDDLE_HEIGHT,
    borderRadius: 18,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  roadText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#374151",
  },
  roadSubText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
  },
});
