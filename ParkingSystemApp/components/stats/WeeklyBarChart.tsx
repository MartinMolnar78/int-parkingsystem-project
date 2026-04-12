import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TOTAL_SPOTS } from "../../data/historicalStats";
import { DayOccupancy } from "../../types/stats";

type Props = {
  data: DayOccupancy[];
};

export default function WeeklyBarChart({ data }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.chart}>
        {data.map((item) => {
          const barHeight = Math.max(14, (item.cars / TOTAL_SPOTS) * 170);

          return (
            <View key={item.key} style={styles.barItem}>
              <Text style={styles.valueText}>{item.cars}</Text>

              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: barHeight }]} />
              </View>

              <Text style={styles.dayLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
  },
  chart: {
    height: 220,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barItem: {
    flex: 1,
    alignItems: "center",
  },
  valueText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  barTrack: {
    width: 28,
    height: 170,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 14,
  },
  dayLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#4b5563",
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  scaleText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
