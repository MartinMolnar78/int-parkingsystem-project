import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Spot } from "../types/parking";

type Props = {
  spot: Spot;
};

export default function ParkingSpot({ spot }: Props) {
  const isFree = spot.status === "free";

  return (
    <View
      style={[styles.spot, { backgroundColor: isFree ? "#22c55e" : "#ef4444" }]}
    >
      <Text style={styles.spotNumber}>{spot.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  spot: {
    width: 60,
    height: 110,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  spotNumber: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
